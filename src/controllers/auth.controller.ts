import { Request, Response } from 'express'
import _ from 'lodash'
import authService from '@/services/auth.service'
import { httpError, httpOk, httpUnauthorized, httpUnprocessable } from '@/utils/apiHandler'
import ApiError from '@/utils/ApiError'

const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body
    const user = await authService.register(name, email, password)
    const transformedUser = _.omit(user, ['password', 'createdAt', 'updatedAt'])
    return httpOk(res, transformedUser)
  } catch (error) {
    if (error instanceof ApiError) {
      return httpUnprocessable(res, error.errors)
    } else {
      return httpError(res, error)
    }
  }
}

const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body
    const user = await authService.login(email, password)
    return httpOk(res, user)
  } catch (error) {
    if (error instanceof ApiError) {
      return httpUnauthorized(res)
    } else {
      return httpError(res, error)
    }
  }
}

export default {
  register,
  login
}
