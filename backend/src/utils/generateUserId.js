import { User } from '../models/User.js'

// Produces a friendly, shareable id like "UT-28491" (matches the frontend's
// mock data shape) and retries on the rare collision.
export async function generateUniqueUserId() {
  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = `UT-${Math.floor(10000 + Math.random() * 90000)}`
    // eslint-disable-next-line no-await-in-loop
    const exists = await User.exists({ userId: candidate })
    if (!exists) return candidate
  }
  // Extremely unlikely fallback - timestamp-based, still short and unique enough.
  return `UT-${Date.now().toString().slice(-6)}`
}
