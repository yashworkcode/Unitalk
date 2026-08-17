import { Router } from 'express'
import { history } from '../controllers/messageController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

router.get('/:chatId', history)

export default router
