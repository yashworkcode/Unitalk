import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import chatRoutes from './routes/chats.js'
import messageRoutes from './routes/messages.js'
import { diagnoseProviders } from './services/translationService.js'
import { notFound, errorHandler } from './middleware/errorHandler.js'

export function createApp() {
  const app = express()

  // Allow requests from any origin (reflects the caller's origin, so it also works with credentials)
  const corsOptions = {
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  }
  app.use(cors(corsOptions))
  app.options('*', cors(corsOptions)) // answer preflight requests
  app.use(express.json({ limit: '15mb' })) // generous enough for base64 image/voice attachments
  if (process.env.NODE_ENV !== 'test') app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))

  app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }))

  // Open in a browser to see which translation provider works on the server, e.g.
  // /api/health/translate?text=buenos%20dias&from=Spanish&to=French
  app.get('/api/health/translate', async (req, res) => {
    const { text = 'good morning', from = 'English', to = 'Spanish' } = req.query
    res.json({
      configuredProvider: process.env.TRANSLATION_PROVIDER || 'google-cloud',
      hasGoogleKey: !!process.env.GOOGLE_TRANSLATE_API_KEY,
      results: await diagnoseProviders(String(text), String(to), String(from)),
    })
  })

  app.use('/api/auth', authRoutes)
  app.use('/api/users', userRoutes)
  app.use('/api/chats', chatRoutes)
  app.use('/api/messages', messageRoutes)

  app.use(notFound)
  app.use(errorHandler)

  return app
}