import type { Database } from '@api/core/db/db.types'
import type {
  chargeItems,
  chargePayments,
  charges,
  contactOptOutTokens,
  contacts,
} from '@api/modules/contacts/contacts.table'
import type { LinkLimitDeps } from '@api/modules/identity'
import type { PostingDetails } from '@api/modules/ledger'
import type {
  ChargeEmailStatus,
  ChargeMark,
  ChargeSentVia,
  ChargeStatus,
  ChargeSummary,
  ContactBalance,
  ContactChargeState,
  ContactOptOutVia,
} from '@financas/shared'

export type ContactRow = typeof contacts.$inferSelect

export type NewContactRow = typeof contacts.$inferInsert

export type ContactUpdate = Partial<
  Omit<NewContactRow, 'workspaceId' | 'id' | 'createdAt' | 'updatedAt'>
>

export type ContactOptOut = Pick<NewContactRow, 'optedOutAt' | 'optedOutVia'>

export type ContactItem = {
  id: string
  name: string
  phoneE164: string | null
  email: string | null
  pixKey: string | null
  notes: string | null
  isOptedOut: boolean
  optedOutVia: ContactOptOutVia | null
  isArchived: boolean
}

export type ContactsContext = {
  workspaceId: string
  userId: string
}

export type ContactRef = {
  workspaceId: string
  contactId: string
}

export type DeleteContactInput = ContactRef & {
  userId: string
  reason?: string
}

export type CreatedContact = {
  contactId: string
}

export type ContactRouteDeps = {
  db: Database
}

export type ContactOptOutRouteDeps = LinkLimitDeps & {
  db: Database
}

export type OptOutTokenRow = typeof contactOptOutTokens.$inferSelect

export type NewOptOutTokenRow = typeof contactOptOutTokens.$inferInsert

export type ContactSummary = {
  name: string
  phoneE164: string | null
  email: string | null
}

export type ContactBalanceItem = ContactBalance & ContactSummary & ContactChargeState

export type ChargeRow = typeof charges.$inferSelect

export type NewChargeRow = typeof charges.$inferInsert

export type NewChargeItemRow = typeof chargeItems.$inferInsert

export type ChargeUpdate = Partial<
  Pick<
    NewChargeRow,
    | 'status'
    | 'sentAt'
    | 'sentVia'
    | 'sentTo'
    | 'emailStatus'
    | 'emailError'
    | 'messageText'
    | 'pixPayload'
  >
>

export type ChargeItemView = PostingDetails & {
  amountCents: number
}

export type ChargeItemRow = {
  chargeId: string
  postingId: string
  amountCents: number
}

export type OpenItemsRef = {
  workspaceId: string
  contactId: string
}

export type OpenChargeFacts = {
  marks: ReadonlyMap<string, ChargeMark>
  chargesByContact: ReadonlyMap<string, ChargeSummary[]>
}

export type ChargeView = {
  id: string
  contactId: string
  amountCents: number
  dueOn: string | null
  status: ChargeStatus
  paidCents: number
  messageText: string
  pixPayload: string | null
  sentAt: Date | null
  sentVia: ChargeSentVia | null
  sentTo: string | null
  emailStatus: ChargeEmailStatus | null
  emailError: string | null
  createdAt: Date
  items: ChargeItemView[]
}

export type ChargeRef = {
  workspaceId: string
  chargeId: string
}

export type CreatedCharge = {
  chargeId: string
}

export type NewChargePaymentRow = typeof chargePayments.$inferInsert

export type ChargePaymentRow = {
  chargeId: string
  entryId: string
  amountCents: number
}

export type RecordedPayment = {
  entryId: string
}
