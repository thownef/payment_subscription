import multer from 'multer'
import { Request, Response, NextFunction } from 'express'
import ApiError from '@/utils/ApiError'
import httpStatus from 'http-status'
import { httpUnprocessable } from '@/utils/apiHandler'

// File filter function
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allowed file types
  const allowedTypes = /jpeg|jpg|png|gif|webp|svg|pdf|doc|docx|txt|mp4|avi|mov|wmv/

  // Check file extension
  const extname = allowedTypes.test(file.originalname.toLowerCase())

  // Check MIME type
  const mimetype = allowedTypes.test(file.mimetype)

  if (mimetype && extname) {
    return cb(null, true)
  } else {
    cb(
      new ApiError(
        httpStatus.UNPROCESSABLE_ENTITY,
        'Invalid file type. Only images, documents, and videos are allowed.'
      )
    )
  }
}

// Configure multer
const upload = multer({
  storage: multer.memoryStorage(), // Store in memory for Cloudinary upload
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files per request
  },
  fileFilter
})

// Middleware for single file upload
export const uploadSingle = (fieldName: string = 'file') => {
  return (req: Request, res: Response, next: NextFunction) => {
    upload.single(fieldName)(req, res, (err: any) => {
      if (err instanceof multer.MulterError) {
        // Multer-specific errors - format like Zod validation
        let errorMessage = err.message
        if (err.code === 'LIMIT_FILE_SIZE') {
          errorMessage = 'File size exceeds 10MB limit'
        } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          errorMessage = `Unexpected field. Expected field name: '${fieldName}'`
        }
        return httpUnprocessable(res, [{ field: fieldName, message: errorMessage }], 'Validation failed')
      } else if (err instanceof ApiError) {
        // File filter errors - format like Zod validation
        return httpUnprocessable(res, [{ field: fieldName, message: err.message }], 'Validation failed')
      } else if (err) {
        // Other errors
        return next(err)
      }
      next()
    })
  }
}

// Middleware for multiple files upload
export const uploadMultiple = (fieldName: string = 'files', maxCount: number = 5) => {
  return (req: Request, res: Response, next: NextFunction) => {
    upload.array(fieldName, maxCount)(req, res, (err: any) => {
      if (err instanceof multer.MulterError) {
        // Multer-specific errors - format like Zod validation
        let errorMessage = err.message
        if (err.code === 'LIMIT_FILE_SIZE') {
          errorMessage = 'File size exceeds 10MB limit'
        } else if (err.code === 'LIMIT_FILE_COUNT') {
          errorMessage = `Too many files. Maximum ${maxCount} files allowed`
        } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          errorMessage = `Unexpected field. Expected field name: '${fieldName}'`
        }
        return httpUnprocessable(res, [{ field: fieldName, message: errorMessage }], 'Validation failed')
      } else if (err instanceof ApiError) {
        // File filter errors - format like Zod validation
        return httpUnprocessable(res, [{ field: fieldName, message: err.message }], 'Validation failed')
      } else if (err) {
        // Other errors
        return next(err)
      }
      next()
    })
  }
}

export default upload
