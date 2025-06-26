import axios from 'axios'
import { User } from '../App'

const API_BASE_URL = import.meta.env.VITE_API_URL || (
  import.meta.env.PROD 
    ? '/api'  // In production, use relative path (same domain)
    : 'http://localhost:3000/api'  // In development, use localhost
)

const api = axios.create({
  baseURL: API_BASE_URL,
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export interface Note {
  id: string
  user_id: string
  content: string
  created_at: string
}

export interface NotesResponse {
  notes: Note[]
  user: User
  planLimits: {
    maxNotes: number | null
    currentCount: number
  }
}

export interface LoginResponse {
  token: string
  user: User
}

export interface SubscribeResponse {
  checkoutUrl: string
  message: string
}

// Auth API
export const authAPI = {
  login: async (email: string): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', { email })
    return response.data
  },

  getCurrentUser: async (): Promise<{ user: User }> => {
    const response = await api.get('/auth/me')
    return response.data
  }
}

// Notes API
export const notesAPI = {
  getNotes: async (): Promise<NotesResponse> => {
    const response = await api.get('/notes')
    return response.data
  },

  createNote: async (content: string): Promise<{ note: Note }> => {
    const response = await api.post('/notes', { content })
    return response.data
  },

  deleteNote: async (id: string): Promise<void> => {
    await api.delete(`/notes/${id}`)
  }
}

// Subscription API
export const subscriptionAPI = {
  getCheckoutUrl: async (): Promise<SubscribeResponse> => {
    const response = await api.get('/subscribe')
    return response.data
  }
} 