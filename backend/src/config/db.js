import mongoose from 'mongoose'

export async function connectDb() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI is not set. Copy .env.example to .env and configure it.')

  mongoose.set('strictQuery', true)

  mongoose.connection.on('connected', () => console.log('[db] connected to MongoDB'))
  mongoose.connection.on('error', err => console.error('[db] connection error:', err.message))
  mongoose.connection.on('disconnected', () => console.warn('[db] disconnected from MongoDB'))

  await mongoose.connect(uri)
  return mongoose.connection
}
