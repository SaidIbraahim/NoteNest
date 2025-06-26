import { Router, Response } from 'express'
import { supabase } from '../lib/supabase.js'
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware.js'
import { planGuard } from '../middleware/planGuard.js'

const router = Router()

// Get all notes for authenticated user
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' })
    }

    const { data: notes, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching notes:', error)
      return res.status(500).json({ error: 'Failed to fetch notes' })
    }

    // Also return user plan info
    res.json({
      notes: notes || [],
      user: {
        id: req.user.id,
        email: req.user.email,
        plan: req.user.plan
      },
      planLimits: {
        maxNotes: req.user.plan === 'pro' ? null : 3,
        currentCount: notes?.length || 0
      }
    })
  } catch (error) {
    console.error('Get notes error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Create new note (with plan enforcement)
router.post('/', authMiddleware, planGuard, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' })
    }

    const { content } = req.body

    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'Content is required' })
    }

    if (content.trim().length === 0) {
      return res.status(400).json({ error: 'Content cannot be empty' })
    }

    const { data: note, error } = await supabase
      .from('notes')
      .insert({
        user_id: req.user.id,
        content: content.trim()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating note:', error)
      return res.status(500).json({ error: 'Failed to create note' })
    }

    res.status(201).json({ note })
  } catch (error) {
    console.error('Create note error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Delete note
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' })
    }

    const noteId = req.params.id

    // Verify note belongs to user before deleting
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', noteId)
      .eq('user_id', req.user.id)

    if (error) {
      console.error('Error deleting note:', error)
      return res.status(500).json({ error: 'Failed to delete note' })
    }

    res.json({ message: 'Note deleted successfully' })
  } catch (error) {
    console.error('Delete note error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router 