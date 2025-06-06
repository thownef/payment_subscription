import express from 'express'
import validate from '@/middleware/validate'
import { authValidation } from '@/validations'
import { authController } from '@/controllers'
import { authenticate, refreshToken } from '@/middleware/auth.middleware'

const router = express.Router()

router.route('/register').post(validate(authValidation.register), authController.register)
router.route('/login').post(validate(authValidation.login), authController.login)
router.route('/refresh-token').post(validate(authValidation.refreshToken), refreshToken)
router.route('/me').get(authenticate, authController.me)
router.route('/logout').post(authenticate, validate(authValidation.logout), authController.logout)

export default router
