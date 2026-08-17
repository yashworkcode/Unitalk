import { User } from '../models/User.js'
import { verifyToken } from '../utils/token.js'

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : null
    if (!token) return res.status(401).json({ message: 'Please sign in to continue.' })

    const payload = verifyToken(token)
    const user = await User.findById(payload.sub)
    if (!user) return res.status(401).json({ message: 'Your session is no longer valid. Please sign in again.' })

    req.user = user
    next()
  } catch (error) {
    return res.status(401).json({ message: 'Your session has expired. Please sign in again.' })
  }
}
