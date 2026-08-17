import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { connectDb } from '../config/db.js'
import { User } from '../models/User.js'
import { generateUniqueUserId } from './generateUserId.js'

const DEMO_USERS = [
  { name: 'Ari Morgan', username: 'arimorgan', email: 'ari@example.com', chatLanguage: 'English' },
  { name: 'Mateo Diaz', username: 'mateodiaz', email: 'mateo@example.com', chatLanguage: 'Spanish' },
]
const DEMO_PASSWORD = 'password123'

async function seed() {
  await connectDb()
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12)

  for (const demo of DEMO_USERS) {
    // eslint-disable-next-line no-await-in-loop
    const existing = await User.findOne({ email: demo.email })
    if (existing) {
      console.log(`[seed] ${demo.email} already exists, skipping`)
      continue
    }
    // eslint-disable-next-line no-await-in-loop
    const userId = await generateUniqueUserId()
    // eslint-disable-next-line no-await-in-loop
    await User.create({
      ...demo,
      userId,
      passwordHash,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(demo.name)}`,
    })
    console.log(`[seed] created ${demo.email} / password: ${DEMO_PASSWORD}`)
  }

  console.log('[seed] done')
  process.exit(0)
}

seed().catch(error => {
  console.error('[seed] failed:', error)
  process.exit(1)
})
