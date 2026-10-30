import { PIX_KEY_MAX_LENGTH } from '@shared/contacts/contacts/contacts.schemas'
import {
  BUDGET_BASES,
  INSTALLMENT_BUDGET_VIEWS,
  MAX_ANCHOR_BUSINESS_DAY,
  MAX_ANCHOR_DAY_OF_MONTH,
  PERIOD_ANCHORS,
  type PeriodAnchor,
} from '@shared/identity/workspaces/workspaces.constants'
import { z } from 'zod'

export const WORKSPACE_NAME_MAX_LENGTH = 80

export const workspaceNameSchema = z.string().trim().min(1).max(WORKSPACE_NAME_MAX_LENGTH)

export const workspaceIdSchema = z.uuid()

export const workspaceNameRequestSchema = z.object({ name: workspaceNameSchema })

function isTimeZone(value: string): boolean {
  try {
    new Intl.DateTimeFormat('en', { timeZone: value })
    return true
  } catch {
    return false
  }
}

function hasAnyField(change: object): boolean {
  return Object.values(change).some((value) => value !== undefined)
}

export function isAnchorValueValid(
  anchor: PeriodAnchor,
  value: number | null | undefined,
): boolean {
  if (anchor === 'calendar_month') {
    return value === undefined || value === null
  }
  const maxValue = anchor === 'day_of_month' ? MAX_ANCHOR_DAY_OF_MONTH : MAX_ANCHOR_BUSINESS_DAY
  return typeof value === 'number' && value <= maxValue
}

function anchorValueFits({
  periodAnchor,
  periodAnchorValue,
}: {
  periodAnchor?: PeriodAnchor
  periodAnchorValue?: number | null
}): boolean {
  if (periodAnchor === undefined) {
    return periodAnchorValue === undefined
  }
  return isAnchorValueValid(periodAnchor, periodAnchorValue)
}

export const workspaceSettingsChangeSchema = z
  .object({
    currency: z
      .string()
      .regex(/^[A-Z]{3}$/)
      .optional(),
    timezone: z.string().refine(isTimeZone, 'Unknown time zone').optional(),
    locale: z
      .string()
      .regex(/^[a-z]{2}(-[A-Z]{2})?$/)
      .optional(),
    periodAnchor: z.enum(PERIOD_ANCHORS).optional(),
    periodAnchorValue: z.number().int().min(1).nullable().optional(),
    installmentBudgetView: z.enum(INSTALLMENT_BUDGET_VIEWS).optional(),
    budgetBase: z.enum(BUDGET_BASES).optional(),
    weekStartsOn: z.number().int().min(0).max(6).optional(),
  })
  .strict()
  .refine(hasAnyField, { message: 'Nothing to change' })
  .refine(anchorValueFits, {
    message: 'Send periodAnchor with a value that fits it',
    path: ['periodAnchorValue'],
  })

export type WorkspaceNameRequest = z.infer<typeof workspaceNameRequestSchema>
export type WorkspaceSettingsChange = z.infer<typeof workspaceSettingsChangeSchema>

export const PIX_RECEIVER_NAME_MAX_LENGTH = 25

export const PIX_RECEIVER_CITY_MAX_LENGTH = 15

export const pixReceivingSchema = z
  .strictObject({
    key: z.string().trim().min(1).max(PIX_KEY_MAX_LENGTH),
    receiverName: z.string().trim().min(1).max(PIX_RECEIVER_NAME_MAX_LENGTH),
    receiverCity: z.string().trim().min(1).max(PIX_RECEIVER_CITY_MAX_LENGTH),
  })
  .nullable()

export type PixReceiving = z.infer<typeof pixReceivingSchema>
