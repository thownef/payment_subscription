import _ from 'lodash'
import httpStatus from 'http-status'
import { User } from '@prisma/client'
import { prisma } from '@/index'
import ApiError from '@/utils/ApiError'
import { encryptPassword, verifyPassword } from '@/utils/encryption'

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

const login = async (email: string, password: string): Promise<User> => {
  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid email or password')
  }

  const encryptedPassword = await verifyPassword(password, user.password)
  if (!encryptedPassword) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid email or password')
  }

  return _.omit(user, ['password']) as User
}

// const logout = async (refreshToken: string): Promise<void> => {
//   const refreshTokenData = await prisma.token.findFirst({
//     where: {
//       token: refreshToken,
//       type: TokenType.REFRESH,
//       blacklisted: false
//     }
//   })
//   if (!refreshTokenData) {
//     throw new ApiError(httpStatus.NOT_FOUND, 'Not found')
//   }
//   await prisma.token.delete({ where: { id: refreshTokenData.id } })
// }

// const refreshAuth = async (refreshToken: string): Promise<AuthTokensResponse> => {
//   try {
//     const refreshTokenData = await tokenService.verifyToken(refreshToken, TokenType.REFRESH)
//     const { userId } = refreshTokenData
//     await prisma.token.delete({ where: { id: refreshTokenData.id } })
//     return tokenService.generateAuthTokens({ id: userId })
//   } catch (error) {
//     throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate')
//   }
// }

// const resetPassword = async (resetPasswordToken: string, newPassword: string): Promise<void> => {
//   try {
//     const resetPasswordTokenData = await tokenService.verifyToken(resetPasswordToken, TokenType.RESET_PASSWORD)
//     const user = await userService.getUserById(resetPasswordTokenData.userId)
//     if (!user) {
//       throw new Error()
//     }
//     const encryptedPassword = await encryptPassword(newPassword)
//     await userService.updateUserById(user.id, { password: encryptedPassword })
//     await prisma.token.deleteMany({ where: { userId: user.id, type: TokenType.RESET_PASSWORD } })
//   } catch (error) {
//     throw new ApiError(httpStatus.UNAUTHORIZED, 'Password reset failed')
//   }
// }

// const verifyEmail = async (verifyEmailToken: string): Promise<void> => {
//   try {
//     const verifyEmailTokenData = await tokenService.verifyToken(verifyEmailToken, TokenType.VERIFY_EMAIL)
//     await prisma.token.deleteMany({
//       where: { userId: verifyEmailTokenData.userId, type: TokenType.VERIFY_EMAIL }
//     })
//     await userService.updateUserById(verifyEmailTokenData.userId, { isEmailVerified: true })
//   } catch (error) {
//     throw new ApiError(httpStatus.UNAUTHORIZED, 'Email verification failed')
//   }
// }

export default {
  register,
  login
  // isPasswordMatch,
  // encryptPassword,
  // logout,
  // refreshAuth,
  // resetPassword,
  // verifyEmail
}
