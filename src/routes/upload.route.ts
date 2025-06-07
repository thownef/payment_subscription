import { authenticate } from '@/middleware/auth.middleware'
import express from 'express'
import { uploadController } from '@/controllers'
import catchAsync from '@/utils/catchAsync'

const router = express.Router()

router.route('/').get(authenticate, catchAsync(uploadController.getList))

export default router
