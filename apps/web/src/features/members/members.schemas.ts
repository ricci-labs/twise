import {
  APP_MODULES,
  emailSchema,
  PERMISSION_ACTIONS,
  ROLE_DESCRIPTION_MAX_LENGTH,
  ROLE_NAME_MAX_LENGTH,
} from '@financas/shared'
import { membersMessages } from '@web/features/members/members.messages'
import { phoneE164Of } from '@web/lib/format/phone'
import { z } from 'zod'

export const roleFormSchema = z.object({
  name: z.string().trim().min(1).max(ROLE_NAME_MAX_LENGTH),
  description: z.string().trim().max(ROLE_DESCRIPTION_MAX_LENGTH),
  permissions: z
    .array(z.object({ module: z.enum(APP_MODULES), action: z.enum(PERMISSION_ACTIONS) }))
    .min(1),
})

export const inviteFormSchema = z
  .object({
    channel: z.enum(['email', 'phone']),
    email: z.string(),
    callingCode: z.string(),
    phone: z.string(),
    roleId: z.string().min(1),
  })
  .refine((input) => input.channel !== 'email' || emailSchema.safeParse(input.email).success, {
    path: ['email'],
    message: membersMessages.invite.emailInvalid,
  })
  .refine(
    (input) =>
      input.channel !== 'phone' ||
      phoneE164Of({ callingCode: input.callingCode, number: input.phone }) !== null,
    { path: ['phone'], message: membersMessages.invite.phoneInvalid },
  )
