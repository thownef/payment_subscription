import { Request, Response } from 'express'
import httpStatus from 'http-status'
import passport from 'passport'
import jwt, { SignOptions } from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import { getMilliseconds } from '@/utils'
import ApiError from '@/utils/ApiError'
import { httpOk } from '@/utils/apiHandler'

const prisma = new PrismaClient()

export const authenticate = passport.authenticate('jwt', { session: false })

export const generateTokens = async (userId: number) => {
  const accessToken = jwt.sign({ sub: userId }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m'
  } as SignOptions)

  const refreshToken = jwt.sign({ sub: userId }, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  } as SignOptions)

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: userId,
      expiresAt: new Date(Date.now() + getMilliseconds(process.env.JWT_REFRESH_EXPIRES_IN || '7d'))
    }
  })

  return {
    accessToken,
    accessTokenExpiresAt: Date.now() + getMilliseconds(process.env.JWT_EXPIRES_IN || '15m'),
    refreshToken,
    refreshTokenExpiresAt: Date.now() + getMilliseconds(process.env.JWT_REFRESH_EXPIRES_IN || '7d')
  }
}

export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body

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

  const tokens = await generateTokens(userId)
  return httpOk(res, tokens)
}
