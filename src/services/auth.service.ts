import httpStatus from 'http-status'
import { User } from '@prisma/client'
import { prisma } from '@/index'
import { encryptPassword, verifyPassword } from '@/utils/encryption'
import { generateTokens } from '@/middleware/auth.middleware'
import ApiError from '@/utils/ApiError'
import jwt from 'jsonwebtoken'

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

  const tokens = await generateTokens(user.id)

  return { ...user, ...tokens }
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

const refreshToken = async (refreshToken: string) => {
  const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { sub: string }
  const userId = parseInt(payload.sub, 10)

  const storedToken = await prisma.refreshToken.findFirst({
    where: {
      token: refreshToken,
      userId: userId,
      isRevoked: false,
      expiresAt: {
        gt: new Date()
      }
    }
  })

  if (!storedToken) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid refresh token')
  }

  await prisma.refreshToken.update({
    where: { id: storedToken.id },
    data: { isRevoked: true }
  })

  return await generateTokens(userId)
}

export default {
  register,
  login,
  logout,
  refreshToken
}
