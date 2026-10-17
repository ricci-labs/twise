import {
  CONTACT_NAME_MAX_LENGTH,
  CONTACT_NOTES_MAX_LENGTH,
  emailSchema,
  PIX_KEY_MAX_LENGTH,
} from '@financas/shared'
import { contactsMessages } from '@web/features/contacts/contacts.messages'
import { phoneE164Of } from '@web/lib/format/phone'
import { formMessages } from '@web/lib/forms/forms.messages'
import { z } from 'zod'

export const CONTACT_SORTS = ['overdue', 'name'] as const

const NEW = 'new'

export const contactsSearchSchema = z.object({
  sort: z.enum(CONTACT_SORTS).optional().catch(undefined),
})

export const contactDetailSearchSchema = z.object({
  charge: z
    .union([z.literal(NEW), z.uuid()])
    .optional()
    .catch(undefined),
})

export const contactSearchSchema = z.object({
  contact: z
    .union([z.literal(NEW), z.uuid()])
    .optional()
    .catch(undefined),
})

export const contactFormSchema = z
  .object({
    name: z.string().trim().min(1).max(CONTACT_NAME_MAX_LENGTH),
    callingCode: z.string(),
    phone: z.string(),
    email: z
      .string()
      .trim()
      .refine((text) => text === '' || emailSchema.safeParse(text).success, formMessages.email),
    pixKey: z.string().trim().max(PIX_KEY_MAX_LENGTH),
    notes: z.string().trim().max(CONTACT_NOTES_MAX_LENGTH),
    isOptedOut: z.boolean(),
  })
  .refine(
    ({ callingCode, phone }) =>
      phone.trim() === '' || phoneE164Of({ callingCode, number: phone }) !== null,
    { path: ['phone'], message: contactsMessages.form.phoneInvalid },
  )
