import z from 'zod'
import { DeliveryType, TemplateType } from '@/enums/template.enum'

const getTemplates = {
  query: z.object({
    sort_by: z.string().optional(),
    limit: z.coerce.number().int().positive().optional(),
    page: z.coerce.number().int().positive().optional(),
    type: z.nativeEnum(TemplateType).optional()
  })
} as const

export type TQueryTemplates = z.infer<typeof getTemplates.query>

const create = {
  body: z.object({
    emailSettingId: z.coerce.number().int().positive().optional(),
    name: z.string().min(1),
    subject: z.string().optional(),
    block: z.object({}).passthrough().optional(),
    settingBlock: z.object({}).passthrough().optional(),
    content: z.string().min(1),
    deliveryType: z.nativeEnum(DeliveryType),
    scheduledAt: z.coerce.date().optional(),
    isClickMeasure: z.boolean().optional(),
    type: z.nativeEnum(TemplateType),
    image: z.string().min(1)
  })
} as const

export type TCreateTemplate = z.infer<typeof create.body>

const update = {
  body: z.object({
    name: z.string().min(1).optional(),
    subject: z.string().optional(),
    block: z.object({}).passthrough().optional(),
    settingBlock: z.object({}).passthrough().optional(),
    content: z.string().min(1).optional(),
    deliveryType: z.nativeEnum(DeliveryType).optional(),
    scheduledAt: z.coerce.date().optional(),
    isClickMeasure: z.boolean().optional(),
    type: z.nativeEnum(TemplateType).optional(),
    image: z.string().min(1).optional()
  }),
  params: z.object({
    id: z.coerce.number()
  })
} as const

export type TUpdateTemplate = z.infer<typeof update.body>

const destroy = {
  params: z.object({
    id: z.coerce.number()
  })
} as const

export type TDeleteTemplate = z.infer<typeof destroy.params>

export default {
  getTemplates,
  create,
  update,
  destroy
}
