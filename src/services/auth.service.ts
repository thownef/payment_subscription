import _ from 'lodash'
import httpStatus from 'http-status'
import { User } from '@prisma/client'
import { prisma } from '@/index'
import ApiError from '@/utils/ApiError'
import { encryptPassword, verifyPassword } from '@/utils/encryption'
import { generateTokens } from '@/middleware/auth.middleware'

const register = async (name: string, email: string, password: string): Promise<User> => {
  const existingUser = await prisma.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    throw new ApiError(httpStatus.UNPROCESSABLE_ENTITY, 'Email already exists', [
      { field: 'email', message: 'Email already exists' }
    ])
  }

  const user = await prisma.user.create({
    data: {
      email: email,
      name: name,
      password: await encryptPassword(password)
    }
  })

  return user
}

const login = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid email or password')
  }

  const isPasswordValid = await verifyPassword(password, user.password)
  if (!isPasswordValid) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid email or password')
  }

  return generateTokens(user.id)
}

const logout = async (userId: number, refreshToken: string) => {
  await prisma.refreshToken.update({
    where: {
      token: refreshToken,
      userId,
      isRevoked: false
    },
    data: {
      isRevoked: true
    }
  })
}

export default {
  register,
  login,
  logout
}
