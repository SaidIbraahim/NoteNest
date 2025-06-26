import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { notesAPI, subscriptionAPI, Note } from '../services/api'

const Notes = () => {
  const { user, logout, refreshUser } = useAuth()
  const [notes, setNotes] = useState<Note[]>([])
  const [newNote, setNewNote] = useState('')
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [planLimits, setPlanLimits] = useState({ maxNotes: null as number | null, currentCount: 0 })
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    fetchNotes()
    
    // Check for upgrade success/cancel in URL
    const params = new URLSearchParams(window.location.search)
    if (params.get('upgraded') === 'true') {
      setSuccessMessage('🎉 Successfully upgraded to Pro! You now have unlimited notes.')
      // Refresh user data to show Pro plan
      refreshUser()
      // Remove the parameter from URL
      const newUrl = window.location.pathname
      window.history.replaceState({}, '', newUrl)
    } else if (params.get('cancelled') === 'true') {
      setError('Payment was cancelled. You can upgrade anytime.')
      // Remove the parameter from URL  
      const newUrl = window.location.pathname
      window.history.replaceState({}, '', newUrl)
    }
  }, [])

  const fetchNotes = async () => {
    try {
      const response = await notesAPI.getNotes()
      setNotes(response.notes)
      setPlanLimits(response.planLimits)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load notes')
    } finally {
      setLoading(false)
    }
  }

  const createNote = async () => {
    if (!newNote.trim()) return

    setCreating(true)
    setError('')

    try {
      const response = await notesAPI.createNote(newNote)
      setNotes([response.note, ...notes])
      setNewNote('')
      setPlanLimits(prev => ({ ...prev, currentCount: prev.currentCount + 1 }))
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create note')
    } finally {
      setCreating(false)
    }
  }

  const deleteNote = async (id: string) => {
    try {
      await notesAPI.deleteNote(id)
      setNotes(notes.filter(note => note.id !== id))
      setPlanLimits(prev => ({ ...prev, currentCount: prev.currentCount - 1 }))
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete note')
    }
  }

  const handleUpgrade = async () => {
    try {
      const response = await subscriptionAPI.getCheckoutUrl()
      window.open(response.checkoutUrl, '_blank')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to get checkout URL')
    }
  }

  const isAtLimit = planLimits.maxNotes !== null && planLimits.currentCount >= planLimits.maxNotes

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">NoteNest</h1>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                user?.plan === 'pro' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {user?.plan === 'pro' ? 'Pro' : 'Free'}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user?.email}</span>
              <button
                onClick={refreshUser}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Refresh Plan
              </button>
              <button
                onClick={logout}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Plan Status */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Your Notes</h2>
              <p className="text-sm text-gray-600">
                {planLimits.maxNotes === null 
                  ? `${planLimits.currentCount} notes (unlimited)` 
                  : `${planLimits.currentCount} / ${planLimits.maxNotes} notes`
                }
              </p>
            </div>
            {user?.plan === 'free' && (
              <button
                onClick={handleUpgrade}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
              >
                Upgrade to Pro
              </button>
            )}
          </div>
        </div>

        {/* Create Note */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="space-y-4">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Write your note here..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={creating}
            />
            <div className="flex justify-between items-center">
              <div>
                {isAtLimit && (
                  <p className="text-sm text-red-600">
                    You've reached the limit of {planLimits.maxNotes} notes. 
                    <button 
                      onClick={handleUpgrade}
                      className="text-blue-600 hover:text-blue-700 underline ml-1"
                    >
                      Upgrade to Pro
                    </button> for unlimited notes.
                  </p>
                )}
              </div>
              <button
                onClick={createNote}
                disabled={creating || !newNote.trim() || isAtLimit}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? 'Creating...' : 'Create Note'}
              </button>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
            <p className="text-green-600 text-sm">{successMessage}</p>
            <button 
              onClick={() => setSuccessMessage('')}
              className="text-green-600 hover:text-green-700 text-xs underline mt-1"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-red-600 text-sm">{error}</p>
            <button 
              onClick={() => setError('')}
              className="text-red-600 hover:text-red-700 text-xs underline mt-1"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Notes List */}
        <div className="space-y-4">
          {notes.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-500">No notes yet. Create your first note!</p>
            </div>
          ) : (
            notes.map((note) => (
              <div key={note.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-gray-900 whitespace-pre-wrap">{note.content}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {new Date(note.created_at).toLocaleDateString()} at{' '}
                      {new Date(note.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="ml-4 text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}

export default Notes 