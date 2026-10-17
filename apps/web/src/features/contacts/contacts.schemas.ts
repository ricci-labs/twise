import { z } from 'zod'

export const CONTACT_SORTS = ['overdue', 'name'] as const

const NEW = 'new'

export const contactsSearchSchema = z.object({
  sort: z.enum(CONTACT_SORTS).optional().catch(undefined),
  contact: z.literal(NEW).optional().catch(undefined),
})

export const contactDetailSearchSchema = z.object({
  charge: z.literal(NEW).optional().catch(undefined),
})
