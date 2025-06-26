import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

// Use service key for server-side operations
export const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Types for our database tables
export interface User {
  id: string
  email: string
  plan: 'free' | 'pro'
  created_at: string
}

export interface Note {
  id: string
  user_id: string
  content: string
  created_at: string
} 