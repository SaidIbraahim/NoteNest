import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Login from './pages/Login'
import Notes from './pages/Notes'
import { AuthContext } from './contexts/AuthContext'
import { authAPI } from './services/api'

export interface User {
  id: string
  email: string
  plan: 'free' | 'pro'
}

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing token in localStorage
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = (newToken: string, newUser: User) => {
    setToken(newToken)
    setUser(newUser)
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(newUser))
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const refreshUser = async () => {
    if (!token) return
    
    try {
      console.log('Refreshing user data...')
      // Get fresh user data from server
      const response = await authAPI.getCurrentUser()
      console.log('Fresh user data:', response.user)
      setUser(response.user)
      localStorage.setItem('user', JSON.stringify(response.user))
      console.log('User data updated in state and localStorage')
    } catch (error) {
      console.error('Failed to refresh user:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, refreshUser }}>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route 
            path="/login" 
            element={!user ? <Login /> : <Navigate to="/notes" replace />} 
          />
          <Route 
            path="/notes" 
            element={user ? <Notes /> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/" 
            element={<Navigate to={user ? "/notes" : "/login"} replace />} 
          />
        </Routes>
      </div>
    </AuthContext.Provider>
  )
}

export default App 