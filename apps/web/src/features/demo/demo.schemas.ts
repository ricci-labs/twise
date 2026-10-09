import { DEMO_VARIANTS } from '@financas/shared'
import { z } from 'zod'

export const demoSearchSchema = z.object({
  period: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/)
    .optional()
    .catch(undefined),
  variant: z.enum(DEMO_VARIANTS).optional().catch(undefined),
})
