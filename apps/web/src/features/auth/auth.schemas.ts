import { MAX_NOTIFY_DAYS_BEFORE, PASSWORD_MAX_LENGTH, passwordSchema } from '@financas/shared'
import { authMessages } from '@web/features/auth/auth.messages'
import { z } from 'zod'

export const LOGIN_NOTICES = [
  'session-ended',
  'logged-out',
  'password-changed',
  'email-verified',
] as const

export const loginSearchSchema = z.object({
  next: z.string().optional().catch(undefined),
  notice: z.enum(LOGIN_NOTICES).optional().catch(undefined),
})

export const newPasswordSchema = z
  .object({ password: passwordSchema, confirmation: z.string().min(1) })
  .refine((fields) => fields.password === fields.confirmation, {
    path: ['confirmation'],
    error: authMessages.resetPassword.mismatch,
  })

export const passwordChangeFormSchema = z
  .object({
    currentPassword: z.string().min(1).max(PASSWORD_MAX_LENGTH),
    newPassword: passwordSchema,
    confirmation: z.string().min(1),
  })
  .refine((fields) => fields.newPassword === fields.confirmation, {
    path: ['confirmation'],
    error: authMessages.resetPassword.mismatch,
  })

export const quietHoursFormSchema = z.object({
  isOn: z.boolean(),
  start: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  end: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
})

export const noticesFormSchema = z.object({
  daysBefore: z.number().int().min(0).max(MAX_NOTIFY_DAYS_BEFORE),
})
