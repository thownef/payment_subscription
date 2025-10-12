import { Request, Response } from 'express'
import { uploadService } from '@/services'
import { TUploadFile, TQueryUploads } from '@/validations/upload.validation'
import ApiError from '@/utils/ApiError'
import httpStatus from 'http-status'
import { httpCreated, httpOk, httpNoContent, httpUnprocessable } from '@/utils/apiHandler'
import { User } from '@prisma/client'

const uploadSingle = async (req: Request, res: Response) => {
  if (!req.file) {
    return httpUnprocessable(res, [{ field: 'file', message: 'No file uploaded' }], 'Validation failed')
  }

  const user = req.user as User
  const options: TUploadFile = req.body
  const upload = await uploadService.uploadFile(req.file, user.id, options)

  return httpCreated(res, upload, 'File uploaded successfully')
}

const uploadMultiple = async (req: Request, res: Response) => {
  if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No files uploaded')
  }

  const user = req.user as User
  const options: TUploadFile = req.body
  const uploads = await uploadService.uploadMultipleFiles(req.files, user.id, options)

  return httpCreated(res, uploads, 'Files uploaded successfully')
}

const getList = async (req: Request, res: Response) => {
  const user = req.user as User
  const query: TQueryUploads = req.query
  const filter: any = { userId: user.id }

  if (query.folder) {
    filter.folder = query.folder
  }

  const options = {
    limit: query.limit,
    page: query.page,
    sortBy: query.sort_by
  }

  const result = await uploadService.getList(filter, options)

  return httpOk(res, result, 'Uploads retrieved successfully')
}

const destroy = async (req: Request, res: Response) => {
  const user = req.user as User
  const id = parseInt(req.params.id)
  await uploadService.destroy(id, user.id)

  return httpNoContent(res)
}

const destroyMultiple = async (req: Request, res: Response) => {
  const user = req.user as User
  const { ids } = req.body
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid or empty ids array')
  }

  await uploadService.destroyMultiple(ids, user.id)

  return httpNoContent(res)
}

export default {
  uploadSingle,
  uploadMultiple,
  getList,
  destroy,
  destroyMultiple
}
