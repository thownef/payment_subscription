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
  headers: z.object({
    'x-refresh-token': z.string()
  })
} as const

const refreshToken = {
  body: z.object({
    refresh_token: z.string()
  })
} as const

export default {
  register,
  login,
  logout,
  refreshToken
}
