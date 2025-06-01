import { Request, Response, NextFunction } from 'express'
import passport from 'passport'
import jwt, { SignOptions } from 'jsonwebtoken'
import { PrismaClient, User } from '@prisma/client'
import ApiError from '@/utils/ApiError'
import httpStatus from 'http-status'

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
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  })

  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  }
}

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  const { refresh_token } = req.body

  if (!refresh_token) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Refresh token is required')
  }

  try {
    const payload = jwt.verify(refresh_token, process.env.JWT_REFRESH_SECRET!) as { sub: string }
    const userId = parseInt(payload.sub, 10)

    const storedToken = await prisma.refreshToken.findFirst({
      where: {
        token: refresh_token,
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
    res.json(tokens)
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid refresh token')
    }
    throw error
  }
}

