import { PERIOD_ANCHORS } from '@shared/identity/workspaces/workspaces.constants'
import { isAnchorValueValid } from '@shared/identity/workspaces/workspaces.schemas'
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

export const periodPreviewQuerySchema = z
  .object({
    anchor: z.enum(PERIOD_ANCHORS),
    value: z.coerce.number().int().min(1).optional(),
  })
  .refine(({ anchor, value }) => isAnchorValueValid(anchor, value), {
    message: 'Send a value that fits the anchor',
    path: ['value'],
  })

export type PeriodPreviewQuery = z.infer<typeof periodPreviewQuerySchema>
