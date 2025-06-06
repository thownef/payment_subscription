import { Request, Response } from 'express'
import _ from 'lodash'
import authService from '@/services/auth.service'
import { httpError, httpNoContent, httpOk, httpUnauthorized, httpUnprocessable } from '@/utils/apiHandler'
import ApiError from '@/utils/ApiError'
import { User } from '@prisma/client'

const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body
    const user = await authService.register(name, email, password)
    const transformedUser = _.omit(user, ['password', 'createdAt', 'updatedAt'])
    return httpOk(res, transformedUser)
  } catch (error) {
    if (error instanceof ApiError) {
      return httpUnprocessable(res, error.errors)
    }
    return httpError(res, error)
  }
}

const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body
    const data = await authService.login(email, password)
    return httpOk(res, data)
  } catch (error) {
    if (error instanceof ApiError) {
      return httpUnauthorized(res)
    }
    return httpError(res, error)
  }
}

const logout = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.headers['x-refresh-token']
    if (!refreshToken || typeof refreshToken !== 'string') {
      return httpUnauthorized(res)
    }

    const { id } = req.user as User
    await authService.logout(id, refreshToken)
    return httpNoContent(res)
  } catch (error) {
    return httpError(res, error)
  }
}

const me = async (req: Request, res: Response) => {
  return httpOk(res, req.user)
}

export default {
  register,
  login,
  logout,
  me
}
