import { authenticate } from '@/middleware/auth.middleware'
import express from 'express'
import { uploadController } from '@/controllers'

const router = express.Router()

router.route('/').get(authenticate, uploadController.getList)

export default router
