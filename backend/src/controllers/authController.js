import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { User, SUPPORTED_LANGUAGES_LIST } from '../models/User.js'
import { generateUniqueUserId } from '../utils/generateUserId.js'
import { signToken } from '../utils/token.js'
import { sendPasswordResetEmail } from '../services/emailService.js'

function avatarFor(name) {
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundType=gradientLinear`
}

export async function register(req, res, next) {
  try {
    const { name, username, email, password, chatLanguage } = req.body || {}

    if (!name || !username || !email || !password) {
      return res.status(400).json({ message: 'Name, username, email, and password are all required.' })
    }
    if (String(username).trim().length < 3) return res.status(400).json({ message: 'Username must be at least 3 characters.' })
    if (String(password).length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters.' })
    if (chatLanguage && !SUPPORTED_LANGUAGES_LIST.includes(chatLanguage)) {
      return res.status(400).json({ message: 'Unsupported language.' })
    }

    const normalizedEmail = String(email).trim().toLowerCase()
    const normalizedUsername = String(username).trim().toLowerCase()

    const existing = await User.findOne({ $or: [{ email: normalizedEmail }, { username: normalizedUsername }] })
    if (existing) {
      return res.status(409).json({ message: existing.email === normalizedEmail ? 'An account with that email already exists.' : 'That username is already taken.' })
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const userId = await generateUniqueUserId()

    const user = await User.create({
      userId,
      name: String(name).trim(),
      username: normalizedUsername,
      email: normalizedEmail,
      passwordHash,
      avatar: avatarFor(name),
      chatLanguage: chatLanguage || 'English',
    })

    const token = signToken(user._id.toString())
    res.status(201).json({ token, user: user.toApiUser() })
  } catch (error) {
    next(error)
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body || {}
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' })

    const user = await User.findOne({ email: String(email).trim().toLowerCase() }).select('+passwordHash')
    // Guards against malformed/legacy documents that somehow have no passwordHash
    // (e.g. inserted by hand while testing) - treat that the same as "wrong
    // password" instead of crashing bcrypt.compare with undefined.
    if (!user || !user.passwordHash) return res.status(401).json({ message: 'Incorrect email or password.' })

    const matches = await bcrypt.compare(password, user.passwordHash)
    if (!matches) return res.status(401).json({ message: 'Incorrect email or password.' })

    user.isOnline = true
    user.lastSeen = new Date()
    await user.save()

    const token = signToken(user._id.toString())
    res.json({ token, user: user.toApiUser() })
  } catch (error) {
    next(error)
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body || {}
    if (!email) return res.status(400).json({ message: 'Please enter your email address.' })

    const user = await User.findOne({ email: String(email).trim().toLowerCase() })
    // Always respond the same way whether or not the account exists, so callers can't
    // use this endpoint to discover which emails have accounts.
    if (user) {
      const rawToken = crypto.randomBytes(32).toString('hex')
      user.resetPasswordTokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')
      user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
      await user.save()
      await sendPasswordResetEmail(user.email, rawToken).catch(err => console.error('[email] failed to send reset email:', err.message))
    }

    res.json({ message: 'If an account exists for that email, a reset link is on its way.' })
  } catch (error) {
    next(error)
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { token } = req.params
    const { password } = req.body || {}
    if (!password || password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters.' })

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
    const user = await User.findOne({ resetPasswordTokenHash: tokenHash, resetPasswordExpires: { $gt: new Date() } }).select('+resetPasswordTokenHash +resetPasswordExpires')
    if (!user) return res.status(400).json({ message: 'This reset link is invalid or has expired.' })

    user.passwordHash = await bcrypt.hash(password, 12)
    user.resetPasswordTokenHash = undefined
    user.resetPasswordExpires = undefined
    await user.save()

    const newToken = signToken(user._id.toString())
    res.json({ token: newToken, user: user.toApiUser() })
  } catch (error) {
    next(error)
  }
}

export async function me(req, res) {
  res.json({ user: req.user.toApiUser() })
}

export async function logout(req, res, next) {
  try {
    req.user.isOnline = false
    req.user.lastSeen = new Date()
    await req.user.save()
    res.json({ message: 'Signed out.' })
  } catch (error) {
    next(error)
  }
}
