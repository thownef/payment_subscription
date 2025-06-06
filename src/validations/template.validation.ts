import z from 'zod'

const getTemplates = {
  query: z.object({
    userId: z.number().optional(),
    type: z.string().optional(),
    sortBy: z.string().optional(),
    limit: z.coerce.number().int().positive().optional(),
    page: z.coerce.number().int().positive().optional()
  })
} as const

export type TQueryTemplates = z.infer<typeof getTemplates.query>

export default {
  getTemplates
}
