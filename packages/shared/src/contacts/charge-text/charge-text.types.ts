import type {
  ChargeTag,
  ChargeTextField,
  ChargeTextIssueReason,
} from '@shared/contacts/charge-text/charge-text.constants'
import type { IsoDate } from '@shared/core/calendar/calendar.types'

export type ChargeText = {
  subject: string
  opening: string
  closing: string | null
}

export type ChargeTextView = ChargeText & {
  isDefault: boolean
}

export type ChargeTextIssue = {
  field: ChargeTextField
  reason: ChargeTextIssueReason
  tag?: string
  maxLength?: number
}

export type ChargeTagSource = {
  contactName: string
  requesterName: string
  workspaceName: string
  totalCents: number
  dueOn: IsoDate | null
}

export type ChargeTagValues = Readonly<Record<ChargeTag, string>>
