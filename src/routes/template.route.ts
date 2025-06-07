import express from 'express'
import validate from '@/middleware/validate.middleware'
import { authenticate } from '@/middleware/auth.middleware'
import templateValidation from '@/validations/template.validation'
import templateController from '@/controllers/template.controller'
import catchAsync from '@/utils/catchAsync'

const router = express.Router()

router
  .route('/')
  .get(authenticate, validate(templateValidation.getTemplates), catchAsync(templateController.getList))
  .post(authenticate, validate(templateValidation.create), catchAsync(templateController.create))

router
  .route('/:id')
  .put(authenticate, validate(templateValidation.update), catchAsync(templateController.update))
  .delete(authenticate, validate(templateValidation.destroy), catchAsync(templateController.destroy))

export default router
