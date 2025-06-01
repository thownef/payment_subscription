import { Request } from 'express'
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt'
import { Strategy as LocalStrategy } from 'passport-local'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const configurePassport = (passport: any) => {
  // Local Strategy
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password'
      },
      async (email: string, password: string, done: any) => {
        try {
          const user = await prisma.user.findUnique({ where: { email } })

          if (!user) {
            return done(null, false, { message: 'Incorrect email.' })
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
          const user = await prisma.user.findUnique({
            where: { id: payload.sub }
          })

          if (!user) {
            return done(null, false)
          }

          return done(null, user)
        } catch (error) {
          return done(error, false)
        }
      }
    )
  )
}
