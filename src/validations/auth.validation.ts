import { z } from 'zod'

const register = {
  body: z
    .object({
      name: z.string().min(1),
      email: z.string().email(),
      password: z.string().min(8),
      confirm_password: z.string().min(8)
    })
    .superRefine(({ password, confirm_password }, ctx) => {
      if (password !== confirm_password) {
        ctx.addIssue({
          code: 'custom',
          message: "Passwords don't match",
          path: ['confirm_password']
        })
      }
    })
} as const

const login = {
  body: z.object({
    email: z.string(),
    password: z.string().min(8)
  })
} as const

const logout = {
  body: z.object({
    refreshToken: z.string()
  })
} as const

const refreshTokens = {
  body: z.object({
    refreshToken: z.string()
  })
} as const

const forgotPassword = {
  body: z.object({
    email: z.string().email()
  })
} as const

const resetPassword = {
  query: z.object({
    token: z.string()
  }),
  body: z.object({
    password: z.string().min(8)
  })
} as const

// Verify Email
const verifyEmail = {
  query: z.object({
    token: z.string()
  })
} as const

export default {
  register,
  login
  // logout,
  // refreshTokens,
  // forgotPassword,
  // resetPassword,
  // verifyEmail
}
