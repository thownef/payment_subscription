import { Request, Response } from 'express'
import _ from 'lodash'
import { httpNoContent, httpOk } from '@/utils/apiHandler'
import { User } from '@prisma/client'
import templateService from '@/services/template.service'
import { TQueryTemplates } from '@/validations/template.validation'
import { BaseController } from './base.controller'

const getList = async (req: Request, res: Response) => {
  const user = req.user as User
  const query = req.query as TQueryTemplates
  const tenantId = req.tenantId!
  
  const filter = {
    userId: user.id,
    type: query.type
  }
  const options = _.pick(query, ['sort_by', 'limit', 'page'])
  const templates = await templateService.getList(filter, options, tenantId)
  return httpOk(res, templates)
}

const create = async (req: Request, res: Response) => {
  const user = req.user as User
  const body = req.body
  const tenantId = req.tenantId!
  
  const template = await templateService.create({
    ...body,
    userId: user.id
  }, tenantId)
  return httpOk(res, template)
}

const update = async (req: Request, res: Response) => {
  const body = req.body
  const tenantId = req.tenantId!
  
  const template = await templateService.update(body, Number(req.params.id), tenantId)
  return httpOk(res, template)
}

const destroy = async (req: Request, res: Response) => {
  const tenantId = req.tenantId!
  
  await templateService.destroy(Number(req.params.id), tenantId)
  return httpNoContent(res)
}

export default {
  getList,
  create,
  update,
  destroy
}
