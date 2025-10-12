import httpStatus from 'http-status'
import { User } from '@prisma/client'
import { prisma } from '@/index'
import { encryptPassword, verifyPassword } from '@/utils/encryption'
import { generateTokens } from '@/middleware/auth.middleware'
import ApiError from '@/utils/ApiError'
import jwt from 'jsonwebtoken'
import { getTenantPrisma } from '@/services/tenantDatabase.service'

const register = async (name: string, email: string, password: string, tenantId: number): Promise<User> => {
  const tenantPrisma = await getTenantPrisma(tenantId)
  
  const existingUser = await tenantPrisma.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    throw new ApiError(httpStatus.UNPROCESSABLE_ENTITY, 'Email already exists', [
      { field: 'email', message: 'Email already exists' }
    ])
  }

  const user = await tenantPrisma.user.create({
    data: {
      email: email,
      name: name,
      password: await encryptPassword(password)
    }
  })

  return user
}

const login = async (email: string, password: string, tenantId: number) => {
  const tenantPrisma = await getTenantPrisma(tenantId)
  
  const user = await tenantPrisma.user.findUnique({
    where: { email }
  })

  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid email or password')
  }

  if (!user.isActive) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Account is inactive')
  }

  const isPasswordValid = await verifyPassword(password, user.password)
  if (!isPasswordValid) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid email or password')
  }

  const tokens = await generateTokens(user.id, tenantId)

  return { ...user, ...tokens }
}

const logout = async (userId: number, refreshToken: string, tenantId: number) => {
  const tenantPrisma = await getTenantPrisma(tenantId)
  
  await tenantPrisma.refreshToken.update({
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

const refreshToken = async (refreshToken: string, tenantId: number) => {
  const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { sub: string; tenantId: number }
  const userId = parseInt(payload.sub, 10)

  // Validate tenant ID from token matches request
  if (payload.tenantId !== tenantId) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid tenant context')
  }

  const tenantPrisma = await getTenantPrisma(tenantId)
  
  const storedToken = await tenantPrisma.refreshToken.findFirst({
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

  await tenantPrisma.refreshToken.update({
    where: { id: storedToken.id },
    data: { isRevoked: true }
  })

  return await generateTokens(userId, tenantId)
}

export default {
  register,
  login,
  logout,
  refreshToken
}
