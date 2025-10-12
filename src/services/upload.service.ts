import { prisma } from '@/index'
import { Upload } from '@prisma/client'
import { TUploadFile, TUpdateUpload } from '@/validations/upload.validation'
import ApiError from '@/utils/ApiError'
import httpStatus from 'http-status'
import cloudinary from '@/config/cloudinary.config'
import { UploadApiResponse } from 'cloudinary'

const uploadFile = async (
  file: Express.Multer.File,
  userId: number,
  options: TUploadFile = { folder: 'uploads' }
): Promise<Upload> => {
  let cloudinaryResult: UploadApiResponse | null = null

  try {
    const uploadOptions = {
      folder: options.folder || 'uploads',
      transformation: options.transformation
    }

    // Upload to Cloudinary
    cloudinaryResult = await new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(uploadOptions, (error, result) => {
          if (error) reject(error)
          else resolve(result!)
        })
        .end(file.buffer)
    })

    // Save to database
    const upload = await prisma.upload.create({
      data: {
        userId,
        name: file.originalname,
        url: cloudinaryResult.secure_url,
        width: cloudinaryResult.width,
        height: cloudinaryResult.height,
        size: cloudinaryResult.bytes,
        folder: uploadOptions.folder,
        publicId: cloudinaryResult.public_id
      }
    })

    return upload
  } catch (error) {
    // Rollback: Delete from Cloudinary if DB save failed
    if (cloudinaryResult?.public_id) {
      try {
        await cloudinary.uploader.destroy(cloudinaryResult.public_id)
      } catch (rollbackError) {
        // Log rollback error but don't throw to preserve original error
        console.error('Failed to rollback Cloudinary upload:', rollbackError)
      }
    }

    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      error instanceof Error ? error.message : 'Failed to upload file'
    )
  }
}

const uploadMultipleFiles = async (
  files: Express.Multer.File[],
  userId: number,
  options: TUploadFile = { folder: 'uploads' }
): Promise<Upload[]> => {
  const uploadPromises = files.map((file) => uploadFile(file, userId, options))
  return Promise.all(uploadPromises)
}

const getList = async (
  filter: object,
  options: {
    limit?: number
    page?: number
    sortBy?: string
    sortType?: 'asc' | 'desc'
  }
): Promise<{ data: Upload[]; pagination: { currentPage: number; perPage: number; total: number } }> => {
  const page = options.page ?? 1
  const limit = options.limit ?? 10
  const sortBy = options.sortBy
  const sortType = options.sortType ?? 'desc'

  const uploads = await prisma.upload.findMany({
    where: filter,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: sortBy ? { [sortBy]: sortType } : { createdAt: 'desc' }
  })

  const total = await prisma.upload.count({
    where: filter
  })

  return {
    data: uploads,
    pagination: { currentPage: page, perPage: limit, total }
  }
}

const getById = async (id: number, userId: number): Promise<Upload> => {
  const upload = await prisma.upload.findFirst({
    where: { id, userId }
  })

  if (!upload) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Upload not found')
  }

  return upload
}

const update = async (id: number, userId: number, data: TUpdateUpload): Promise<Upload> => {
  const upload = await prisma.upload.findFirst({
    where: { id, userId }
  })

  if (!upload) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Upload not found')
  }

  const updatedUpload = await prisma.upload.update({
    where: { id },
    data
  })

  return updatedUpload
}

const destroy = async (id: number, userId: number): Promise<boolean> => {
  const upload = await prisma.upload.findFirst({
    where: { id, userId }
  })

  if (!upload) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Upload not found')
  }

  try {
    const publicId =
      upload.publicId ||
      (() => {
        const urlParts = upload.url.split('/')
        const id = urlParts[urlParts.length - 1].split('.')[0]
        const folder = urlParts[urlParts.length - 2]
        return `${folder}/${id}`
      })()

    await cloudinary.uploader.destroy(publicId)

    await prisma.upload.delete({
      where: { id }
    })

    return true
  } catch {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to delete file from Cloudinary')
  }
}

const destroyMultiple = async (ids: number[], userId: number): Promise<boolean> => {
  const uploads = await prisma.upload.findMany({
    where: { id: { in: ids }, userId }
  })

  if (uploads.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No uploads found')
  }

  try {
    const deletePromises = uploads.map(async (upload) => {
      const publicId =
        upload.publicId ||
        (() => {
          const urlParts = upload.url.split('/')
          const id = urlParts[urlParts.length - 1].split('.')[0]
          const folder = urlParts[urlParts.length - 2]
          return `${folder}/${id}`
        })()

      return cloudinary.uploader.destroy(publicId)
    })

    await Promise.all(deletePromises)

    await prisma.upload.deleteMany({
      where: { id: { in: ids }, userId }
    })

    return true
  } catch {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to delete files from Cloudinary')
  }
}

export default {
  uploadFile,
  uploadMultipleFiles,
  getList,
  getById,
  update,
  destroy,
  destroyMultiple
}
