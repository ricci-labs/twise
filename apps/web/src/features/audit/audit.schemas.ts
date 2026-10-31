import { AUDIT_AREA_KEYS, AUTOMATIC_ACTOR } from '@financas/shared'
import { z } from 'zod'

export const historySearchSchema = z.object({
  area: z.enum(AUDIT_AREA_KEYS).optional().catch(undefined),
  actor: z
    .union([z.uuid(), z.literal(AUTOMATIC_ACTOR)])
    .optional()
    .catch(undefined),
  item: z.uuid().optional().catch(undefined),
  event: z.uuid().optional().catch(undefined),
})
