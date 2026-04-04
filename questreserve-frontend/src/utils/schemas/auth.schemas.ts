import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export type LoginFormValues = z.infer<typeof loginSchema>

export const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  displayName: z.string().min(1, 'Display name is required'),
})

export type RegisterFormValues = z.infer<typeof registerSchema>

export const providerRegisterSchema = registerSchema.extend({
  organizationName: z.string().optional(),
})

export type ProviderRegisterFormValues = z.infer<typeof providerRegisterSchema>
