import mongoose from 'mongoose'

const attachmentSchema = new mongoose.Schema(
  {
    kind: { type: String, enum: ['image', 'video', 'audio'], required: true },
    name: { type: String, required: true },
    url: { type: String, required: true }, // data URL or hosted URL - frontend renders it directly
  },
  { _id: false }
)

const messageSchema = new mongoose.Schema(
  {
    chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true, index: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, default: '', maxlength: 8000 }, // original, un-translated text as typed by the sender
    messageType: { type: String, enum: ['text', 'image', 'video', 'audio', 'file'], default: 'text' },
    attachment: { type: attachmentSchema, default: undefined },
  },
  { timestamps: true }
)

messageSchema.index({ chat: 1, createdAt: 1 })

export const Message = mongoose.model('Message', messageSchema)
