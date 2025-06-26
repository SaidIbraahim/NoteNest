import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { supabase, User } from '../lib/supabase.js'

declare global {
  namespace Express {
    interface Request {
      user?: User
    }
  }
}

export interface AuthRequest extends Request {
  user?: User
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix
    const jwtSecret = process.env.JWT_SECRET!

    if (!jwtSecret) {
      throw new Error('JWT_SECRET not configured')
    }

    // Verify the JWT token
    const decoded = jwt.verify(token, jwtSecret) as { userId: string, email: string }
    
    // Fetch user from database to get current plan status
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.userId)
      .single()

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token or user not found' })
    }

    req.user = user
    next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    return res.status(401).json({ error: 'Invalid token' })
  }
} 