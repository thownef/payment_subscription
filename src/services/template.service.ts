import { prisma } from '@/index'
import { Template } from '@prisma/client'
import { TCreateTemplate, TUpdateTemplate } from '@/validations/template.validation'
import ApiError from '@/utils/ApiError'
import httpStatus from 'http-status'
import { getTenantPrisma } from '@/services/tenantDatabase.service'

const getList = async <Key extends keyof Template>(
  filter: object,
  options: {
    limit?: number
    page?: number
    sortBy?: string
    sortType?: 'asc' | 'desc'
  },
  tenantId: number,
  keys: Key[] = [
    'id',
    'userId',
    'emailSettingId',
    'name',
    'subject',
    'block',
    'settingBlock',
    'content',
    'deliveryType',
    'scheduledAt',
    'image',
    'isClickMeasure',
    'type',
    'createdAt',
    'updatedAt'
  ] as Key[]
): Promise<{ data: Pick<Template, Key>[]; pagination: { currentPage: number; perPage: number; total: number } }> => {
  const page = options.page ?? 1
  const limit = options.limit ?? 10
  const sortBy = options.sortBy
  const sortType = options.sortType ?? 'desc'
  
  const tenantPrisma = await getTenantPrisma(tenantId)
  
  const templates = await tenantPrisma.template.findMany({
    where: filter,
    select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {}),
    skip: (page - 1) * limit,
    take: limit,
    orderBy: sortBy ? { [sortBy]: sortType } : { createdAt: 'desc' }
  })
  const total = await tenantPrisma.template.count({
    where: filter
  })
  return {
    data: templates as Pick<Template, Key>[],
    pagination: { currentPage: page, perPage: limit, total }
  }
}

const create = async (data: TCreateTemplate & { userId: number }, tenantId: number): Promise<Template> => {
  const tenantPrisma = await getTenantPrisma(tenantId)
  
  const template = await tenantPrisma.template.create({
    data
  })
  return template
}

const update = async (data: TUpdateTemplate, id: number, tenantId: number): Promise<Template> => {
  const tenantPrisma = await getTenantPrisma(tenantId)
  
  const template = await tenantPrisma.template.findUnique({
    where: { id }
  })
  if (!template) {
    throw new ApiError(httpStatus.NOT_FOUND)
  }
  const updatedTemplate = await tenantPrisma.template.update({
    where: { id: id },
    data
  })
  return updatedTemplate
}

const destroy = async (id: number, tenantId: number) => {
  const tenantPrisma = await getTenantPrisma(tenantId)
  
  const template = await tenantPrisma.template.findUnique({
    where: { id }
  })
  if (!template) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Template not found')
  }
  await tenantPrisma.template.delete({
    where: { id }
  })
  return true
}
export default {
  getList,
  create,
  update,
  destroy
}
