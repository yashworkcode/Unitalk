import { Chat } from '../models/Chat.js'
import { Message } from '../models/Message.js'
import { User } from '../models/User.js'
import { verifyToken } from '../utils/token.js'
import { translateText } from '../services/translationService.js'

// Tracks which chat each connected user currently has open, so we know
// whether to bump their unread counter when a new message arrives.
// userId (string) -> Set<chatId string>
const activeChatsByUser = new Map()

function markActive(userId, chatId) {
  if (!activeChatsByUser.has(userId)) activeChatsByUser.set(userId, new Set())
  activeChatsByUser.get(userId).add(chatId)
}
function markInactive(userId, chatId) {
  activeChatsByUser.get(userId)?.delete(chatId)
}
function isActive(userId, chatId) {
  return activeChatsByUser.get(userId)?.has(chatId) ?? false
}

function userRoom(userId) {
  return `user:${userId}`
}
function chatRoom(chatId) {
  return `chat:${chatId}`
}

export function initChatSocket(io) {
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token
      if (!token) return next(new Error('Authentication required'))
      const payload = verifyToken(token)
      socket.userId = payload.sub
      next()
    } catch (error) {
      next(new Error('Authentication failed'))
    }
  })

  io.on('connection', socket => {
    const { userId } = socket
    socket.join(userRoom(userId))
    handleConnect(io, socket, userId)

    socket.on('chat:join', async ({ chatId } = {}) => {
      if (!chatId) return
      const chat = await Chat.findOne({ _id: chatId, 'participants.user': userId })
      if (!chat) return
      socket.join(chatRoom(chatId))
      markActive(userId, chatId)

      const own = chat.participantFor(userId)
      if (own?.unread) {
        own.unread = 0
        await chat.save()
      }
    })

    socket.on('chat:leave', ({ chatId } = {}) => {
      if (!chatId) return
      socket.leave(chatRoom(chatId))
      markInactive(userId, chatId)
    })

    socket.on('chat:typing', ({ chatId } = {}) => {
      if (!chatId) return
      socket.to(chatRoom(chatId)).emit('user:typing', { userId, chatId })
    })

    socket.on('chat:language-changed', ({ chatId, language } = {}) => {
      if (!chatId || !language) return
      // REST already persisted the change - just let the other tab/device (if any) know.
      socket.to(userRoom(userId)).emit('chat:language-changed', { chatId, language })
    })

    socket.on('message:send', async payload => {
      try {
        await handleSendMessage(io, userId, payload)
      } catch (error) {
        console.error('[socket] message:send failed:', error.message)
        socket.emit('message:error', { message: 'Your message could not be sent. Please try again.' })
      }
    })

    socket.on('disconnect', () => handleDisconnect(io, socket, userId))
  })
}

async function handleConnect(io, socket, userId) {
  try {
    const user = await User.findByIdAndUpdate(userId, { isOnline: true, lastSeen: new Date() }, { new: true })
    if (!user) return
    await broadcastPresence(io, userId, 'user:online')
  } catch (error) {
    console.error('[socket] connect handler failed:', error.message)
  }
}

async function handleDisconnect(io, socket, userId) {
  try {
    // Only mark offline if this was their last open socket/tab.
    const remaining = await io.in(userRoom(userId)).fetchSockets()
    if (remaining.length > 0) return

    await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: new Date() })
    activeChatsByUser.delete(userId)
    await broadcastPresence(io, userId, 'user:offline')
  } catch (error) {
    console.error('[socket] disconnect handler failed:', error.message)
  }
}

async function broadcastPresence(io, userId, event) {
  const chats = await Chat.find({ 'participants.user': userId }).select('participants')
  const notified = new Set()
  for (const chat of chats) {
    const other = chat.otherParticipantFor(userId)
    if (other && !notified.has(other.user.toString())) {
      notified.add(other.user.toString())
      io.to(userRoom(other.user.toString())).emit(event, { userId })
    }
  }
}

async function handleSendMessage(io, userId, payload) {
  const { chatId, text = '', messageType = 'text', attachment } = payload || {}
  if (!chatId) return
  if (!text.trim() && !attachment) return

  const chat = await Chat.findById(chatId)
  if (!chat) return
  const sender = chat.participantFor(userId)
  const recipient = chat.otherParticipantFor(userId)
  if (!sender || !recipient) return // not a participant of this chat

  const message = await Message.create({
    chat: chat._id,
    sender: userId,
    text,
    messageType,
    attachment: attachment?.url ? { kind: attachment.kind, name: attachment.name, url: attachment.url } : undefined,
  })

  // Translate into the RECIPIENT's preferred language for this conversation.
  const translatedForRecipient = await translateText(text, recipient.language)
  const translatedFlag = translatedForRecipient !== text

  chat.lastMessage = { text, time: message.createdAt }

  const recipientId = recipient.user.toString()
  if (isActive(recipientId, chatId)) {
    recipient.unread = 0
  } else {
    recipient.unread = (recipient.unread || 0) + 1
  }
  await chat.save()

  const receivePayload = {
    id: message._id.toString(),
    chatId: chat._id.toString(),
    senderId: userId,
    messageType,
    attachment: message.attachment,
    createdAt: message.createdAt.toISOString(),
    me: { text, original: text, translated: false },
    them: { text: translatedForRecipient, original: text, translated: translatedFlag },
  }

  // Broadcast to each participant's personal room (covers every open tab/device for that
  // user) rather than the per-chat room, so delivery never depends on whether chat:join
  // happened to fire first - avoids duplicate deliveries too.
  const previewPayload = { chatId: chat._id.toString(), preview: text, time: message.createdAt.toISOString() }
  io.to(userRoom(userId)).emit('message:receive', receivePayload)
  io.to(userRoom(userId)).emit('chat:preview', previewPayload)
  io.to(userRoom(recipientId)).emit('message:receive', receivePayload)
  io.to(userRoom(recipientId)).emit('chat:preview', previewPayload)
}
