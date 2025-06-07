import express from 'express'
import validate from '@/middleware/validate.middleware'
import { authValidation } from '@/validations'
import { authController } from '@/controllers'
import { authenticate, refreshToken } from '@/middleware/auth.middleware'
import catchAsync from '@/utils/catchAsync'

const router = express.Router()

router.route('/register').post(validate(authValidation.register), catchAsync(authController.register))
router.route('/login').post(validate(authValidation.login), catchAsync(authController.login))
router.route('/refresh-token').post(validate(authValidation.refreshToken), refreshToken)
router.route('/me').get(authenticate, catchAsync(authController.me))
router.route('/logout').post(authenticate, validate(authValidation.logout), catchAsync(authController.logout))

export default router
