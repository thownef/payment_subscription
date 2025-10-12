import passport from 'passport'
import jwt, { SignOptions } from 'jsonwebtoken'
import { getMilliseconds } from '@/utils'
import { getTenantPrisma } from '@/services/tenantDatabase.service'

export const authenticate = passport.authenticate('jwt', { session: false })

export const generateTokens = async (userId: number, tenantId: number) => {
  const accessToken = jwt.sign(
    { 
      sub: userId, 
      tenantId: tenantId 
    }, 
    process.env.JWT_SECRET!, 
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '15m'
    } as SignOptions
  )

  const refreshToken = jwt.sign(
    { 
      sub: userId, 
      tenantId: tenantId 
    }, 
    process.env.JWT_REFRESH_SECRET!, 
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    } as SignOptions
  )

  const tenantPrisma = await getTenantPrisma(tenantId)
  await tenantPrisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: userId,
      expiresAt: new Date(Date.now() + getMilliseconds(process.env.JWT_REFRESH_EXPIRES_IN || '7d'))
    }
  })

  return {
    accessToken,
    refreshToken,
    expiresAt: getMilliseconds(process.env.JWT_REFRESH_EXPIRES_IN || '7d') / 1000
  }
}

