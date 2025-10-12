import express from 'express'
import validate from '@/middleware/validate.middleware'
import { authenticate } from '@/middleware/auth.middleware'
import { resolveTenant, requireTenant, validateTenantAccess } from '@/middleware/tenant.middleware'
import templateValidation from '@/validations/template.validation'
import templateController from '@/controllers/template.controller'
import catchAsync from '@/utils/catchAsync'

const router = express.Router()

// All template routes require tenant context
router.use(resolveTenant)
router.use(requireTenant)

router
  .route('/')
  .get(authenticate, validateTenantAccess, validate(templateValidation.getTemplates), catchAsync(templateController.getList))
  .post(authenticate, validateTenantAccess, validate(templateValidation.create), catchAsync(templateController.create))

router
  .route('/:id')
  .put(authenticate, validateTenantAccess, validate(templateValidation.update), catchAsync(templateController.update))
  .delete(authenticate, validateTenantAccess, validate(templateValidation.destroy), catchAsync(templateController.destroy))

export default router
