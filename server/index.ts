import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

// Import routes
import authRoutes from './routes/auth.js'
import notesRoutes from './routes/notes.js'
import subscribeRoutes from './routes/subscribe.js'
import webhookRoutes from './routes/webhook.js'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}))

// Raw body for webhook signature verification
app.use('/api/webhook', express.raw({ type: 'application/json' }))

// JSON body parser for other routes
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/notes', notesRoutes)
app.use('/api/subscribe', subscribeRoutes)
app.use('/api/webhook', webhookRoutes)

// Root endpoint - API information
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to NoteNest API',
    version: '1.0.0',
    status: 'online',
    endpoints: {
      auth: {
        login: 'POST /api/auth/login'
      },
      notes: {
        list: 'GET /api/notes',
        create: 'POST /api/notes',
        delete: 'DELETE /api/notes/:id'
      },
      subscription: {
        checkout: 'GET /api/subscribe'
      },
      webhook: 'POST /api/webhook',
      health: 'GET /health'
    },
    timestamp: new Date().toISOString()
  })
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📚 API Endpoints:`)
  console.log(`   POST /api/auth/login`)
  console.log(`   GET  /api/notes`)
  console.log(`   POST /api/notes`)
  console.log(`   GET  /api/subscribe`)
  console.log(`   POST /api/webhook`)
  console.log(`   GET  /health`)
}) 