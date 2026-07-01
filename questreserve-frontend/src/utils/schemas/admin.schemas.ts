import { z } from 'zod'
import type { AdminRole } from '@/api/admin.api'

const ADMIN_ROLES: AdminRole[] = ['PLATFORM_ADMIN', 'CLIENT_SUCCESS', 'SUPERUSER']

export const createAdminSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password must not exceed 72 characters'),
  role: z.enum(ADMIN_ROLES as [AdminRole, ...AdminRole[]], {
    errorMap: () => ({ message: 'Please select a role' }),
  }),
})

export type CreateAdminFormValues = z.infer<typeof createAdminSchema>
