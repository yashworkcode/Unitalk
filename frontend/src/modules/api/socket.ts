// src/modules/api/socket.ts
// WHAT: The ONE place that creates and holds the Socket.IO connection.
// WHY: components should call connectSocket()/getSocket() rather than each
// creating their own `io(...)` instance - one shared connection per session,
// same reasoning as client.ts for REST calls.

import { io, type Socket } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

let socket: Socket | null = null

export function connectSocket(token: string): Socket {
  if (socket?.connected) return socket
  socket = io(SOCKET_URL, { auth: { token }, transports: ['websocket', 'polling'] })
  return socket
}

export function getSocket(): Socket | null {
  return socket
}

export function disconnectSocket() {
  socket?.disconnect()
  socket = null
}

// ---- Event payload shapes (mirror backend/socket/chatSocket.js) ----
export type ReceivePayload = {
  id: string
  chatId: string
  senderId: string
  messageType: 'text' | 'image' | 'video' | 'audio' | 'file'
  attachment?: { kind: 'image' | 'video' | 'audio'; name: string; url: string }
  createdAt: string
  me: { text: string; original: string; translated: boolean }
  them: { text: string; original: string; translated: boolean }
}

export type ChatPreviewPayload = { chatId: string; preview: string; time: string }
export type TypingPayload = { userId: string; chatId: string }
export type PresencePayload = { userId: string }
export type LanguageChangedPayload = { chatId: string; language: string }
