import { authenticate } from '@/middleware/auth.middleware'
import { resolveTenant, requireTenant, validateTenantAccess } from '@/middleware/tenant.middleware'
import express from 'express'
import { uploadController } from '@/controllers'
import catchAsync from '@/utils/catchAsync'

const router = express.Router()

// All upload routes require tenant context
router.use(resolveTenant)
router.use(requireTenant)

router.route('/').get(authenticate, validateTenantAccess, catchAsync(uploadController.getList))

export default router
