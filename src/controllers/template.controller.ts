import { Request, Response } from 'express'
import _ from 'lodash'
import { httpNoContent, httpOk } from '@/utils/apiHandler'
import { User } from '@prisma/client'
import templateService from '@/services/template.service'
import { TQueryTemplates } from '@/validations/template.validation'

const getList = async (req: Request, res: Response) => {
  const user = req.user as User
  const query = req.query as TQueryTemplates
  const filter = {
    userId: user.id,
    type: query.type
  }
  const options = _.pick(query, ['sort_by', 'limit', 'page'])
  const templates = await templateService.getList(filter, options)
  return httpOk(res, templates)
}

const create = async (req: Request, res: Response) => {
  const user = req.user as User
  const body = req.body
  const template = await templateService.create({
    ...body,
    userId: user.id
  })
  return httpOk(res, template)
}

const update = async (req: Request, res: Response) => {
  const body = req.body
  const template = await templateService.update(body, Number(req.params.id))
  return httpOk(res, template)
}

const destroy = async (req: Request, res: Response) => {
  await templateService.destroy(Number(req.params.id))
  return httpNoContent(res)
}

export default {
  getList,
  create,
  update,
  destroy
}
