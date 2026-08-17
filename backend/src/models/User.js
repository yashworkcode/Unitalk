import mongoose from 'mongoose'

const SUPPORTED_LANGUAGES = ['English', 'Hindi', 'Spanish', 'Portuguese', 'French', 'Japanese', 'Arabic', 'German']

const settingsSchema = new mongoose.Schema(
  {
    showOriginalMessage: { type: Boolean, default: false },
    autoTranslate: { type: Boolean, default: true },
    voiceTranslation: { type: Boolean, default: false },
    subtitleTranslation: { type: Boolean, default: false },
    appLanguage: { type: String, enum: ['English', 'Spanish', 'French'], default: 'English' },
  },
  { _id: false }
)

const userSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true, index: true }, // public share id, e.g. UT-28491
    name: { type: String, required: true, trim: true, maxlength: 80 },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true, minlength: 3, maxlength: 30, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    avatar: { type: String, default: '' },
    country: { type: String, default: '' },
    bio: { type: String, default: '', maxlength: 280 },
    chatLanguage: { type: String, enum: SUPPORTED_LANGUAGES, default: 'English' },
    settings: { type: settingsSchema, default: () => ({}) },
    isOnline: { type: Boolean, default: false },
    lastSeen: { type: Date, default: Date.now },
    resetPasswordTokenHash: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
  },
  { timestamps: true }
)

userSchema.virtual('handle').get(function handle() {
  return `@${this.username}`
})

userSchema.methods.toApiUser = function toApiUser() {
  return {
    id: this._id.toString(),
    userId: this.userId,
    name: this.name,
    username: this.username,
    handle: this.handle,
    email: this.email,
    avatar: this.avatar,
    country: this.country,
    bio: this.bio,
    chatLanguage: this.chatLanguage,
    settings: this.settings,
    isOnline: this.isOnline,
    lastSeen: this.lastSeen ? this.lastSeen.toISOString() : new Date().toISOString(),
  }
}

export const SUPPORTED_LANGUAGES_LIST = SUPPORTED_LANGUAGES
export const User = mongoose.model('User', userSchema)
