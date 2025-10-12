import express from 'express'
import validate from '@/middleware/validate.middleware'
import { authValidation } from '@/validations'
import { authController } from '@/controllers'
import { authenticate } from '@/middleware/auth.middleware'
import { resolveTenant, requireTenant, validateTenantAccess } from '@/middleware/tenant.middleware'
import catchAsync from '@/utils/catchAsync'

const router = express.Router()

// All auth routes require tenant context
router.use(resolveTenant)
router.use(requireTenant)

router.route('/register').post(validate(authValidation.register), catchAsync(authController.register))
router.route('/login').post(validate(authValidation.login), catchAsync(authController.login))
router.route('/refresh-token').post(validate(authValidation.refreshToken), catchAsync(authController.refreshToken))
router.route('/me').get(authenticate, validateTenantAccess, catchAsync(authController.me))
router.route('/logout').post(authenticate, validateTenantAccess, validate(authValidation.logout), catchAsync(authController.logout))

export default router
