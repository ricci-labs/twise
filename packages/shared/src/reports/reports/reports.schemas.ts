import { yearMonthSchema } from '@shared/planning/budgets/budgets.schemas'
import { z } from 'zod'

export const overviewQuerySchema = z.object({ period: yearMonthSchema.optional() })

export type OverviewQuery = z.infer<typeof overviewQuerySchema>

export const PERIODS_FIRST_YEAR = 2000

export const PERIODS_LAST_YEAR = 2100

export const periodsQuerySchema = z.object({
  year: z.coerce.number().int().min(PERIODS_FIRST_YEAR).max(PERIODS_LAST_YEAR).optional(),
})

export type PeriodsQuery = z.infer<typeof periodsQuerySchema>
