import {
  APP_MODULES,
  PERMISSION_ACTIONS,
  ROLE_DESCRIPTION_MAX_LENGTH,
  ROLE_NAME_MAX_LENGTH,
} from '@financas/shared'
import { z } from 'zod'

export const roleFormSchema = z.object({
  name: z.string().trim().min(1).max(ROLE_NAME_MAX_LENGTH),
  description: z.string().trim().max(ROLE_DESCRIPTION_MAX_LENGTH),
  permissions: z
    .array(z.object({ module: z.enum(APP_MODULES), action: z.enum(PERMISSION_ACTIONS) }))
    .min(1),
})
