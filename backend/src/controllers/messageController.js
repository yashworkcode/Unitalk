import { Chat } from '../models/Chat.js'
import { Message } from '../models/Message.js'
import { translateText } from '../services/translationService.js'

export async function history(req, res, next) {
  try {
    const { chatId } = req.params
    const chat = await Chat.findOne({ _id: chatId, 'participants.user': req.user._id })
    if (!chat) return res.status(404).json({ message: 'Conversation not found.' })

    const own = chat.participantFor(req.user._id)
    const targetLanguage = own?.language || 'English'

    const docs = await Message.find({ chat: chat._id }).sort({ createdAt: 1 }).limit(500)

    const messages = await Promise.all(
      docs.map(async doc => {
        const isMine = doc.sender.toString() === req.user._id.toString()
        if (isMine) {
          return {
            id: doc._id.toString(),
            from: 'me',
            text: doc.text,
            time: doc.createdAt.toISOString(),
            attachment: doc.attachment || undefined,
          }
        }
        const translated = doc.messageType === 'text' || !doc.attachment ? await translateText(doc.text, targetLanguage) : doc.text
        return {
          id: doc._id.toString(),
          from: 'them',
          text: translated,
          original: doc.text,
          translated: translated !== doc.text,
          time: doc.createdAt.toISOString(),
          attachment: doc.attachment || undefined,
        }
      })
    )

    // Opening the thread counts as reading it.
    if (own && own.unread) {
      own.unread = 0
      await chat.save()
    }

    res.json({ messages })
  } catch (error) {
    next(error)
  }
}
