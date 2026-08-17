import 'dotenv/config'
import http from 'http'
import { Server } from 'socket.io'
import { createApp } from './src/app.js'
import { connectDb } from './src/config/db.js'
import { initChatSocket } from './src/socket/chatSocket.js'

async function main() {
  await connectDb()

  const app = createApp()
  const server = http.createServer(app)

  const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',').map(origin => origin.trim())
  const io = new Server(server, {
    cors: { origin: allowedOrigins, credentials: true },
    transports: ['websocket', 'polling'],
  })
  initChatSocket(io)

  const port = process.env.PORT || 5000
  server.listen(port, () => {
    console.log(`[server] UniTalk backend listening on http://localhost:${port}`)
    console.log(`[server] Socket.IO ready on the same port`)
  })

  const shutdown = signal => {
    console.log(`\n[server] received ${signal}, shutting down...`)
    server.close(() => process.exit(0))
  }
  process.on('SIGINT', () => shutdown('SIGINT'))
  process.on('SIGTERM', () => shutdown('SIGTERM'))
}

main().catch(error => {
  console.error('[server] failed to start:', error)
  process.exit(1)
})
