import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import chatRoutes from './routes/chats.js'
import messageRoutes from './routes/messages.js'
import { notFound, errorHandler } from './middleware/errorHandler.js'

export function createApp() {
  const app = express()

  const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',').map(origin => origin.trim())
  app.use(cors({ origin: allowedOrigins, credentials: true }))
  app.use(express.json({ limit: '15mb' })) // generous enough for base64 image/voice attachments
  if (process.env.NODE_ENV !== 'test') app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))

  app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }))

  app.use('/api/auth', authRoutes)
  app.use('/api/users', userRoutes)
  app.use('/api/chats', chatRoutes)
  app.use('/api/messages', messageRoutes)

  app.use(notFound)
  app.use(errorHandler)

  return app
}
