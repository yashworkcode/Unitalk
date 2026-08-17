import mongoose from 'mongoose'

// A Chat is a single 1:1 conversation shared by exactly two participants.
// Each participant keeps their OWN translation-language preference and
// unread counter for this conversation, so the same chat id/document can be
// serialized differently depending on who is asking (see toApiChat below).
const participantSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    language: { type: String, default: 'English' }, // language incoming messages get translated INTO for this user
    unread: { type: Number, default: 0 },
    hidden: { type: Boolean, default: false }, // "deleted" the chat from their own list without affecting the other person
  },
  { _id: false }
)

const chatSchema = new mongoose.Schema(
  {
    participants: {
      type: [participantSchema],
      validate: value => Array.isArray(value) && value.length === 2,
    },
    lastMessage: {
      text: { type: String, default: '' },
      time: { type: Date, default: Date.now },
    },
  },
  { timestamps: true }
)

chatSchema.index({ 'participants.user': 1 })

chatSchema.methods.participantFor = function participantFor(userId) {
  return this.participants.find(p => p.user.toString() === userId.toString())
}

chatSchema.methods.otherParticipantFor = function otherParticipantFor(userId) {
  return this.participants.find(p => p.user.toString() !== userId.toString())
}

// `otherUserDoc` must be the already-populated User document for the other participant.
chatSchema.methods.toApiChat = function toApiChat(userId, otherUserDoc) {
  const own = this.participantFor(userId)
  return {
    id: this._id.toString(),
    name: otherUserDoc.name,
    handle: otherUserDoc.handle,
    avatar: otherUserDoc.avatar,
    online: otherUserDoc.isOnline,
    language: own?.language || 'English',
    native: otherUserDoc.chatLanguage,
    preview: this.lastMessage?.text || '',
    time: (this.lastMessage?.time || this.updatedAt || this.createdAt).toISOString(),
    unread: own?.unread || 0,
    otherUserId: otherUserDoc._id.toString(),
  }
}

export const Chat = mongoose.model('Chat', chatSchema)
