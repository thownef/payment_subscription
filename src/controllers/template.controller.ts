import { Request, Response } from 'express'
import _ from 'lodash'
import { httpError, httpNoContent, httpOk } from '@/utils/apiHandler'
import ApiError from '@/utils/ApiError'
import { User } from '@prisma/client'
import { httpNotFound, httpUnprocessable } from '@/utils/apiHandler'
import templateService from '@/services/template.service'
import { TQueryTemplates } from '@/validations/template.validation'

const getList = async (req: Request, res: Response) => {
  try {
    const user = req.user as User
    const query = req.query as TQueryTemplates
    const filter = {
      userId: user.id,
      type: query.type
    }
    const options = _.pick(query, ['sort_by', 'limit', 'page'])
    const templates = await templateService.getList(filter, options)
    return httpOk(res, templates)
  } catch (error) {
    if (error instanceof ApiError) {
      return httpUnprocessable(res, error.errors)
    } else {
      return httpError(res, error)
    }
  }
}

const create = async (req: Request, res: Response) => {
  try {
    const user = req.user as User
    const body = req.body
    const template = await templateService.create({
      ...body,
      userId: user.id
    })
    return httpOk(res, template)
  } catch (error) {
    return httpError(res, error)
  }
}

const update = async (req: Request, res: Response) => {
  try {
    const body = req.body
    const template = await templateService.update(body, Number(req.params.id))
    return httpOk(res, template)
  } catch (error) {
    if (error instanceof ApiError) {
      return httpNotFound(res)
    } else {
      return httpError(res, error)
    }
  }
}

const destroy = async (req: Request, res: Response) => {
  try {
    await templateService.destroy(Number(req.params.id))
    return httpNoContent(res)
  } catch (error) {
    if (error instanceof ApiError) {
      return httpNotFound(res)
    } else {
      return httpError(res, error)
    }
  }
}

export default {
  getList,
  create,
  update,
  destroy
}
