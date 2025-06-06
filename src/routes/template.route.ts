import express from 'express'
import validate from '@/middleware/validate'
import { authenticate } from '@/middleware/auth.middleware'
import templateValidation from '@/validations/template.validation'
import templateController from '@/controllers/template.controller'

const router = express.Router()

router.route('/').get(authenticate, validate(templateValidation.getTemplates), templateController.getList)

export default router
