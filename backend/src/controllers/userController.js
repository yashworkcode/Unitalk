import { User, SUPPORTED_LANGUAGES_LIST } from '../models/User.js'

export async function search(req, res, next) {
  try {
    const q = String(req.query.q || '').trim()
    if (!q) return res.json({ users: [] })

    const safe = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(safe, 'i')

    const users = await User.find({
      _id: { $ne: req.user._id },
      $or: [{ name: regex }, { username: regex }, { userId: regex }],
    }).limit(20)

    res.json({ users: users.map(u => u.toApiUser()) })
  } catch (error) {
    next(error)
  }
}

export async function online(req, res, next) {
  try {
    const users = await User.find({ _id: { $ne: req.user._id }, isOnline: true }).limit(100)
    res.json({ users: users.map(u => u.toApiUser()) })
  } catch (error) {
    next(error)
  }
}

export async function updateProfile(req, res, next) {
  try {
    const { name, bio, country, avatar, chatLanguage } = req.body || {}

    if (chatLanguage && !SUPPORTED_LANGUAGES_LIST.includes(chatLanguage)) {
      return res.status(400).json({ message: 'Unsupported language.' })
    }
    if (name !== undefined) req.user.name = String(name).trim().slice(0, 80)
    if (bio !== undefined) req.user.bio = String(bio).slice(0, 280)
    if (country !== undefined) req.user.country = String(country).slice(0, 60)
    if (avatar !== undefined) req.user.avatar = String(avatar)
    if (chatLanguage !== undefined) req.user.chatLanguage = chatLanguage

    await req.user.save()
    res.json({ user: req.user.toApiUser() })
  } catch (error) {
    next(error)
  }
}

export async function updateSettings(req, res, next) {
  try {
    const allowed = ['showOriginalMessage', 'autoTranslate', 'voiceTranslation', 'subtitleTranslation', 'appLanguage']
    for (const key of allowed) {
      if (req.body?.[key] !== undefined) req.user.settings[key] = req.body[key]
    }
    await req.user.save()
    res.json({ user: req.user.toApiUser() })
  } catch (error) {
    next(error)
  }
}
