import { z } from 'zod'

const register = {
  body: z
    .object({
      name: z.string({ message: 'Name is required' }).min(1, { message: 'Name is required' }),
      email: z.string({ message: 'Email is required' }).email({ message: 'Invalid email address' }),
      password: z
        .string({ message: 'Password is required' })
        .min(6, { message: 'Password must be at least 6 characters long' }),
      confirmPassword: z
        .string({ message: 'Confirm password is required' })
        .min(6, { message: 'Password must be at least 6 characters long' })
    })
    .superRefine(({ password, confirmPassword }, ctx) => {
      if (password !== confirmPassword) {
        ctx.addIssue({
          code: 'custom',
          message: "Passwords don't match"
        })
      }
    })
} as const

const login = {
  body: z.object({
    email: z.string({ message: 'Email is required' }),
    password: z
      .string({ message: 'Password is required' })
      .min(8, { message: 'Password must be at least 8 characters long' })
  })
} as const

const logout = {
  headers: z.object({
    'x-refresh-token': z.string()
  })
} as const

const refreshToken = {
  body: z.object({
    refreshToken: z.string()
  })
} as const

export default {
  register,
  login,
  logout,
  refreshToken
}
