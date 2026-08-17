import { Router } from 'express'
import { register, login, forgotPassword, resetPassword, me, logout } from '../controllers/authController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.post('/register', register)
router.post('/login', login)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password/:token', resetPassword)
router.get('/me', requireAuth, me)
router.post('/logout', requireAuth, logout)

export default router
