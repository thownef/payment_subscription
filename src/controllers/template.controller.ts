import { Request, Response } from 'express'
import _ from 'lodash'
import { httpError, httpOk } from '@/utils/apiHandler'
import ApiError from '@/utils/ApiError'
import { User } from '@prisma/client'
import { httpUnprocessable } from '@/utils/apiHandler'
import templateService from '@/services/template.service'
import { TQueryTemplates } from '@/validations/template.validation'

const getList = async (req: Request, res: Response) => {
  try {
    const user = req.user as User
    const query: TQueryTemplates = { ...req.query, userId: user.id }
    const filter = _.pick(query, ['userId'])
    const options = _.pick(query, ['sortBy', 'limit', 'page'])
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

export default {
  getList
}
