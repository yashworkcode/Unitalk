import { Router } from 'express'
import { search, online, updateProfile, updateSettings } from '../controllers/userController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

router.get('/search', search)
router.get('/online', online)
router.patch('/me', updateProfile)
router.patch('/me/settings', updateSettings)

export default router
