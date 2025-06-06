import _ from 'lodash'
import { prisma } from '@/index'
import { Template } from '@prisma/client'

const getList = async <Key extends keyof Template>(
  filter: object,
  options: {
    limit?: number
    page?: number
    sortBy?: string
    sortType?: 'asc' | 'desc'
  },
  keys: Key[] = ['id', 'userId', 'name', 'content', 'image', 'createdAt', 'updatedAt'] as Key[]
): Promise<{ data: Pick<Template, Key>[]; pagination: { page: number; limit: number; total: number } }> => {
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
    pagination: { page, limit, total }
  }
}

export default {
  getList
}
