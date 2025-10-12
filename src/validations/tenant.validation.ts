import { z } from 'zod'

const register = {
  body: z
    .object({
      name: z.string().min(1, 'Name is required'),
      email: z.string().email('Invalid email address'),
      contractId: z.string().min(1, 'Contract ID is required'),
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

export type TRegisterTenant = z.infer<typeof register.body>

export default {
  register
}
