import { Chat } from '../models/Chat.js'
import { User, SUPPORTED_LANGUAGES_LIST } from '../models/User.js'

async function populateOther(chat, userId) {
  const other = chat.otherParticipantFor(userId)
  const otherUser = await User.findById(other.user)
  return otherUser
}

export async function list(req, res, next) {
  try {
    const chats = await Chat.find({ 'participants.user': req.user._id, 'participants.hidden': { $ne: true } }).sort({ 'lastMessage.time': -1, updatedAt: -1 })

    const apiChats = []
    for (const chat of chats) {
      const own = chat.participantFor(req.user._id)
      if (own?.hidden) continue
      // eslint-disable-next-line no-await-in-loop
      const otherUser = await populateOther(chat, req.user._id)
      if (!otherUser) continue
      apiChats.push(chat.toApiChat(req.user._id, otherUser))
    }
    res.json({ chats: apiChats })
  } catch (error) {
    next(error)
  }
}

export async function create(req, res, next) {
  try {
    const { username, language } = req.body || {}
    if (!username) return res.status(400).json({ message: 'Enter a username to start a conversation.' })

    const targetLanguage = language && SUPPORTED_LANGUAGES_LIST.includes(language) ? language : 'English'
    const cleanUsername = String(username).trim().replace(/^@/, '').toLowerCase()

    const otherUser = await User.findOne({ username: cleanUsername })
    if (!otherUser) return res.status(404).json({ message: `No user found with username "${cleanUsername}".` })
    if (otherUser._id.equals(req.user._id)) return res.status(400).json({ message: "You can't start a conversation with yourself." })

    let chat = await Chat.findOne({
      $and: [{ 'participants.user': req.user._id }, { 'participants.user': otherUser._id }],
    })

    if (chat) {
      const own = chat.participantFor(req.user._id)
      own.language = targetLanguage
      own.hidden = false
      await chat.save()
    } else {
      chat = await Chat.create({
        participants: [
          { user: req.user._id, language: targetLanguage },
          { user: otherUser._id, language: otherUser.chatLanguage || 'English' },
        ],
        lastMessage: { text: '', time: new Date() },
      })
    }

    res.status(201).json({ chat: chat.toApiChat(req.user._id, otherUser) })
  } catch (error) {
    next(error)
  }
}

export async function changeLanguage(req, res, next) {
  try {
    const { chatId } = req.params
    const { language } = req.body || {}
    if (!language || !SUPPORTED_LANGUAGES_LIST.includes(language)) return res.status(400).json({ message: 'Unsupported language.' })

    const chat = await Chat.findOne({ _id: chatId, 'participants.user': req.user._id })
    if (!chat) return res.status(404).json({ message: 'Conversation not found.' })

    const own = chat.participantFor(req.user._id)
    own.language = language
    await chat.save()

    const otherUser = await populateOther(chat, req.user._id)
    res.json({ chat: chat.toApiChat(req.user._id, otherUser) })
  } catch (error) {
    next(error)
  }
}

export async function remove(req, res, next) {
  try {
    const { chatId } = req.params
    const chat = await Chat.findOne({ _id: chatId, 'participants.user': req.user._id })
    if (!chat) return res.status(404).json({ message: 'Conversation not found.' })

    // Hide it for this user only - the other participant keeps their history.
    const own = chat.participantFor(req.user._id)
    own.hidden = true
    own.unread = 0
    await chat.save()

    res.json({ message: 'Conversation removed.' })
  } catch (error) {
    next(error)
  }
}
