import { prisma } from '@/index'
import { Template } from '@prisma/client'
import { TCreateTemplate, TUpdateTemplate } from '@/validations/template.validation'
import ApiError from '@/utils/ApiError'
import httpStatus from 'http-status'

const getList = async <Key extends keyof Template>(
  filter: object,
  options: {
    limit?: number
    page?: number
    sortBy?: string
    sortType?: 'asc' | 'desc'
  },
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
  const templates = await prisma.template.findMany({
    where: filter,
    select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {}),
    skip: (page - 1) * limit,
    take: limit,
    orderBy: sortBy ? { [sortBy]: sortType } : { createdAt: 'desc' }
  })
  const total = await prisma.template.count({
    where: filter
  })
  return {
    data: templates as Pick<Template, Key>[],
    pagination: { currentPage: page, perPage: limit, total }
  }
}

const create = async (data: TCreateTemplate & { userId: number }): Promise<Template> => {
  const template = await prisma.template.create({
    data
  })
  return template
}

const update = async (data: TUpdateTemplate, id: number): Promise<Template> => {
  const template = await prisma.template.findUnique({
    where: { id }
  })
  if (!template) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Template not found')
  }
  const updatedTemplate = await prisma.template.update({
    where: { id: id },
    data
  })
  return updatedTemplate
}

const destroy = async (id: number) => {
  const template = await prisma.template.findUnique({
    where: { id }
  })
  if (!template) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Template not found')
  }
  await prisma.template.delete({
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
