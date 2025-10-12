import express from 'express'
import validate from '@/middleware/validate.middleware'
import catchAsync from '@/utils/catchAsync'
import tenantValidation from '@/validations/tenant.validation'
import tenantController from '@/controllers/tenant.controller'

const router = express.Router()

router.route('/register').post(validate(tenantValidation.register), catchAsync(tenantController.register))

export default router
