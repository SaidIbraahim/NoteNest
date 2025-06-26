import { Response, NextFunction } from 'express'
import { supabase } from '../lib/supabase.js'
import { AuthRequest } from './authMiddleware.js'

export const planGuard = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' })
    }

    // If user has pro plan, allow unlimited notes
    if (req.user.plan === 'pro') {
      return next()
    }

    // For free users, check note count limit (max 3)
    const { count, error } = await supabase
      .from('notes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', req.user.id)

    if (error) {
      console.error('Error checking note count:', error)
      return res.status(500).json({ error: 'Failed to check note limit' })
    }

    if (count !== null && count >= 3) {
      return res.status(403).json({ 
        error: 'Note limit reached. Upgrade to Pro for unlimited notes.',
        limit: 3,
        current: count
      })
    }

    next()
  } catch (error) {
    console.error('Plan guard error:', error)
    return res.status(500).json({ error: 'Failed to enforce plan limits' })
  }
} 