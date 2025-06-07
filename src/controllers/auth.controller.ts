import { Request, Response } from 'express'
import _ from 'lodash'
import authService from '@/services/auth.service'
import { httpNoContent, httpOk, httpUnauthorized } from '@/utils/apiHandler'
import { User } from '@prisma/client'

const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body
  const user = await authService.register(name, email, password)
  const transformedUser = _.omit(user, ['password', 'createdAt', 'updatedAt'])
  return httpOk(res, transformedUser)
}

const login = async (req: Request, res: Response) => {
  const { email, password } = req.body
  const data = await authService.login(email, password)
  return httpOk(res, data)
}

const logout = async (req: Request, res: Response) => {
  const refreshToken = req.headers['x-refresh-token']
  if (!refreshToken || typeof refreshToken !== 'string') {
    return httpUnauthorized(res)
  }

  const { id } = req.user as User
  await authService.logout(id, refreshToken)
  return httpNoContent(res)
}

const me = async (req: Request, res: Response) => {
  return httpOk(res, req.user)
}

const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body
  const data = await refreshToken(refreshToken)
  return httpOk(res, data)
}

export default {
  register,
  login,
  logout,
  me,
  refreshToken
}
