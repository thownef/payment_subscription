import z from 'zod'

// File upload validation
const uploadFile = {
  body: z.object({
    folder: z.string().optional(),
    transformation: z
      .object({
        width: z.number().int().positive().optional(),
        height: z.number().int().positive().optional(),
        crop: z.string().optional(),
        quality: z.string().optional(),
        format: z.string().optional()
      })
      .optional()
  })
} as const

export type TUploadFile = z.infer<typeof uploadFile.body>

// Get uploads list validation
const getUploads = {
  query: z.object({
    sort_by: z.string().optional(),
    limit: z.coerce.number().int().positive().optional(),
    page: z.coerce.number().int().positive().optional(),
    folder: z.string().optional()
  })
} as const

export type TQueryUploads = z.infer<typeof getUploads.query>

// Delete upload validation
const deleteUpload = {
  params: z.object({
    id: z.coerce.number()
  })
} as const

export type TDeleteUpload = z.infer<typeof deleteUpload.params>

// Update upload validation
const updateUpload = {
  params: z.object({
    id: z.coerce.number()
  }),
  body: z.object({
    name: z.string().min(1).optional()
  })
} as const

export type TUpdateUpload = z.infer<typeof updateUpload.body>

export default {
  uploadFile,
  getUploads,
  deleteUpload,
  updateUpload
}
