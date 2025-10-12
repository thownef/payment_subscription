import { Request } from 'express'
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt'
import { Strategy as LocalStrategy } from 'passport-local'
import bcrypt from 'bcryptjs'
import { getTenantPrisma } from '@/services/tenantDatabase.service'
import ApiError from '@/utils/ApiError'
import httpStatus from 'http-status'

export const configurePassport = (passport: any) => {
  // Local Strategy
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
      },
      async (req: Request, email: string, password: string, done: any) => {
        try {
          // Require tenant context for local strategy
          if (!req.tenantId) {
            return done(new ApiError(httpStatus.BAD_REQUEST, 'Tenant context is required'), false)
          }

          const tenantPrisma = await getTenantPrisma(req.tenantId)
          const user = await tenantPrisma.user.findFirst({ where: { email } })

          if (!user) {
            return done(null, false, { message: 'Incorrect email.' })
          }

          if (!user.isActive) {
            return done(null, false, { message: 'Account is inactive.' })
          }

          const isMatch = await bcrypt.compare(password, user.password)

          if (!isMatch) {
            return done(null, false, { message: 'Incorrect password.' })
          }

          return done(null, user)
        } catch (error) {
          return done(error)
        }
      }
    )
  )

  // JWT Strategy
  passport.use(
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET || '',
        passReqToCallback: true
      },
      async (req: Request, payload: any, done: any) => {
        try {
          // Extract tenant ID from JWT payload or request
          const tenantId = payload.tenantId || req.tenantId

          if (!tenantId) {
            return done(new ApiError(httpStatus.BAD_REQUEST, 'Tenant context is required'), false)
          }

          const tenantPrisma = await getTenantPrisma(tenantId)
          const user = await tenantPrisma.user.findFirst({
            where: { id: payload.sub }
          })

          if (!user) {
            return done(null, false)
          }

          if (!user.isActive) {
            return done(null, false)
          }

          // Attach tenant context to request
          req.tenantId = tenantId

          return done(null, user)
        } catch (error) {
          return done(error, false)
        }
      }
    )
  )
}
