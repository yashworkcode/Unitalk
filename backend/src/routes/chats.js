import { Router } from 'express'
import { list, create, changeLanguage, remove } from '../controllers/chatController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

router.get('/', list)
router.post('/', create)
router.patch('/:chatId/language', changeLanguage)
router.delete('/:chatId', remove)

export default router
