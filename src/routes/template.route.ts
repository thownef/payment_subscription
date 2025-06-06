import express from 'express'
import validate from '@/middleware/validate'
import { authenticate } from '@/middleware/auth.middleware'
import templateValidation from '@/validations/template.validation'
import templateController from '@/controllers/template.controller'

const router = express.Router()

router
  .route('/')
  .get(authenticate, validate(templateValidation.getTemplates), templateController.getList)
  .post(authenticate, validate(templateValidation.create), templateController.create)

router
  .route('/:id')
  .put(authenticate, validate(templateValidation.update), templateController.update)
  .delete(authenticate, validate(templateValidation.destroy), templateController.destroy)

export default router
