import { Router, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { supabase } from '../lib/supabase.js'
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware.js'

const router = Router()

// Mock login endpoint - accepts email only
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email } = req.body

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email is required' })
    }

    // Check if user exists, create if not
    let { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error && error.code === 'PGRST116') {
      // User doesn't exist, create new user
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({ email, plan: 'free' })
        .select()
        .single()

      if (createError) {
        console.error('Error creating user:', createError)
        return res.status(500).json({ error: 'Failed to create user' })
      }

      user = newUser
    } else if (error) {
      console.error('Error fetching user:', error)
      return res.status(500).json({ error: 'Database error' })
    }

    if (!user) {
      return res.status(500).json({ error: 'Failed to authenticate user' })
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET!
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      jwtSecret,
      { expiresIn: '7d' }
    )

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        plan: user.plan
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get current user endpoint
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' })
    }

    res.json({ user: req.user })
  } catch (error) {
    console.error('Get current user error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router 