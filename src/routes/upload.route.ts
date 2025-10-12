import { authenticate } from '@/middleware/auth.middleware'
import { uploadSingle, uploadMultiple } from '@/middleware/upload.middleware'
import express from 'express'
import { uploadController } from '@/controllers'
import catchAsync from '@/utils/catchAsync'
import uploadValidation from '@/validations/upload.validation'
import validate from '@/middleware/validate.middleware'

const router = express.Router()

// Upload single file
router.post(
  '/single',
  authenticate,
  uploadSingle('file'),
  validate(uploadValidation.uploadFile),
  catchAsync(uploadController.uploadSingle)
)

// Upload multiple files
router.post(
  '/multiple',
  authenticate,
  uploadMultiple('files', 5),
  validate(uploadValidation.uploadFile),
  catchAsync(uploadController.uploadMultiple)
)

router.get('/', authenticate, validate(uploadValidation.getUploads), catchAsync(uploadController.getList))
router.delete('/:id', authenticate, validate(uploadValidation.deleteUpload), catchAsync(uploadController.destroy))

export default router
