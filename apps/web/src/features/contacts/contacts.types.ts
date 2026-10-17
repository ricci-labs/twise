import type { ChargeText, ContactChange, IsoDate, NewContact, Permission } from '@financas/shared'
import type { UseQueryResult } from '@tanstack/react-query'
import type { ChargeBodyItem, ChargeHistory } from '@web/components/finance/charge-body'
import type { ContactChannel } from '@web/components/finance/contact-row'
import type { FieldControlProps } from '@web/components/forms/form-field'
import type {
  fetchContactBalances,
  fetchContactCharges,
  fetchContactOpenItems,
  fetchContactReceipts,
  fetchContacts,
  fetchUpcomingContactItems,
} from '@web/features/contacts/api/contacts.queries'
import type {
  CONTACT_SORTS,
  contactFormSchema,
  paymentFormSchema,
} from '@web/features/contacts/contacts.schemas'
import type { ReactNode } from 'react'
import type { z } from 'zod'

export type Contact = Awaited<ReturnType<typeof fetchContacts>>[number]

export type ContactBalance = Awaited<ReturnType<typeof fetchContactBalances>>[number]

export type ContactOpenItem = Awaited<ReturnType<typeof fetchContactOpenItems>>[number]

export type ContactCharge = Awaited<ReturnType<typeof fetchContactCharges>>[number]

export type ContactChargeView = {
  id: string
  createdOn: IsoDate
  amountCents: number
  paidCents: number
  status: ContactCharge['status']
  itemCount: number
  history: ChargeHistory | undefined
  sentVia: ContactCharge['sentVia']
  sentTo: string | null
  hasEmailFailed: boolean
  items: ChargeBodyItem[]
  dueOn: IsoDate | null
  isDuePast: boolean
  isOpen: boolean
  canCancel: boolean
  messageText: string
  pixPayload: string | null
}

export type ContactChargesProps = {
  workspaceId: string
  contactId: string
  canUpdate: boolean
  today: IsoDate
  contactName: string
  onResend: (chargeId: string) => void
}

export type ContactChargeItemProps = {
  charge: ContactChargeView
  canUpdate: boolean
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onCancel: () => void
  onResend: () => void
  onRetryEmail: () => void
  onFixEmail: () => void
  onPay: () => void
}

export type ChargePixProps = {
  workspaceId: string
  permissions: readonly Permission[]
  amountCents: number
  pixPayload: string | null
}

export type ChargeEmailSendProps = {
  workspaceId: string
  contactName: string
  currentUser: ChargeSender
  charge: ContactCharge
  email: string
  today: IsoDate
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onSent: () => void
}

export type ChargeActionsInput = {
  charge: ContactChargeView
  canUpdate: boolean
  copyMessage: () => void
  copyPix: (() => void) | null
  onResend: () => void
  onRetryEmail: () => void
  onFixEmail: () => void
  onPay: () => void
}

export type ContactOpenItems = {
  overdue: ContactOpenItem[]
  upcoming: ContactOpenItem[]
}

export type ContactDetailPageProps = {
  workspaceId: string
  contactId: string
  permissions: readonly Permission[]
  onNewCharge: () => void
  onDeleted: () => void
  charge: string | undefined
  currentUser: ChargeSender
  onChargeOpen: (chargeId: string) => void
  onChargeClose: () => void
}

export type NewChargeProps = {
  workspaceId: string
  contact: Contact
  balance: ContactBalance | undefined
  openItems: readonly ContactOpenItem[]
  today: IsoDate
  permissions: readonly Permission[]
  currentUser: ChargeSender
  chargeId?: string
  isOpen: boolean
  onClose: () => void
}

export type ChargeSender = {
  name: string
  email: string
  workspaceName: string
}

export type ChargeComposeProps = NewChargeProps & {
  onCreated: (chargeId: string) => void
}

export type CreatedChargeProps = NewChargeProps & {
  chargeId: string
  isResend: boolean
}

export type ContactMenuDialog = 'archive' | 'delete' | null

export type ContactDetailMenuProps = {
  workspaceId: string
  contact: Contact
  owedCents: number
  permissions: readonly Permission[]
  onNewCharge: () => void
  onDeleted: () => void
}

export type ContactDetailBodyProps = ContactDetailPageProps & {
  contact: Contact
  balance: ContactBalance | undefined
  openItems: readonly ContactOpenItem[]
  today: IsoDate
}

export type ContactDetailFrameProps = Pick<ContactDetailPageProps, 'workspaceId'> & {
  actions?: ReactNode
  children: ReactNode
}

export type ContactDetailActionsProps = {
  contactId: string
  canCharge: boolean
  canRecordReceipt: boolean
  onNewCharge: () => void
}

export type ContactOpenSectionProps = {
  owedCents: number
  items: ContactOpenItems
}

export type ContactTalkToProps = {
  contact: Contact
}

export type ContactSort = (typeof CONTACT_SORTS)[number]

export type ListedContact = {
  id: string
  name: string
  owedCents: number
  overdueCents: number
  overdueSince: IsoDate | null
  nextDueOn: IsoDate | null
  nextDueCents: number
  hasDueToCharge: boolean
  chargedOn: IsoDate | null
  isOptedOut: boolean
  isArchived: boolean
  channels: ContactChannel[]
}

export type ContactsSummary = {
  owedCents: number
  owingCount: number
  overdueCents: number
  overdueCount: number
  overdueSince: IsoDate | null
}

export type ContactsPageProps = {
  workspaceId: string
  permissions: readonly Permission[]
  sort: ContactSort
  onSortChange: (sort: ContactSort) => void
  onCharge: (contactId: string) => void
}

export type ContactsBodyProps = Omit<ContactsPageProps, 'permissions'> & {
  canCreate: boolean
  canUpdate: boolean
  canChangeSettings: boolean
}

export type ContactsLoadedProps = ContactsBodyProps & {
  contacts: readonly ListedContact[]
}

export type ContactsSummaryTilesProps = {
  contacts: readonly ListedContact[]
}

export type ContactListProps = {
  workspaceId: string
  label: string
  contacts: readonly ListedContact[]
  onCharge?: (contactId: string) => void
}

export type ContactFormInput = z.input<typeof contactFormSchema>

export type ContactFormValues = z.output<typeof contactFormSchema>

export type ContactFormDirtyFields = Partial<Record<keyof ContactFormInput, boolean>>

export type SaveContactRequest =
  | { kind: 'create'; input: NewContact }
  | { kind: 'edit'; contactId: string; change: ContactChange }

export type ContactEditorProps = {
  workspaceId: string
  permissions: readonly Permission[]
  param: string | undefined
  onClose: () => void
  onCreated: (contactId: string) => void
}

export type ChangeContactProps = ContactEditorProps & {
  contactId: string
}

export type ContactFormProps = {
  workspaceId: string
  contact: Contact | null
  onClose: () => void
  onCreated: (contactId: string) => void
}

export type ContactFormFooterProps = {
  isEditing: boolean
  isOnline: boolean
  problem: string | null
  onCancel: () => void
}

export type OptOutView = 'confirming' | 'done' | 'linkInvalid' | 'paused' | 'failed'

export type PaymentFormInput = z.input<typeof paymentFormSchema>

export type ChargePaymentSheetProps = {
  workspaceId: string
  contactName: string
  charge: ContactChargeView | null
  today: IsoDate
  onOpenChange: (isOpen: boolean) => void
}

export type ChargePaymentFormProps = Omit<ChargePaymentSheetProps, 'charge'> & {
  charge: ContactChargeView
}

export type PaymentAccountFieldProps = FieldControlProps & {
  accounts: readonly { id: string; name: string; icon: string | null }[]
}

export type ChargeEmailPreviewInput = {
  charge: ContactCharge
  contactName: string
  sender: ChargeSender
  text: ChargeText
  receiver: PixReceiver
  today: IsoDate
}

export type PixReceiver = {
  key?: string | null
  name: string | null
  city: string | null
}

export type UpcomingContactItem = Awaited<ReturnType<typeof fetchUpcomingContactItems>>[number]

export type ContactsDesktopProps = Omit<ContactsLoadedProps, 'contacts'> & {
  active: readonly ListedContact[]
  archived: readonly ListedContact[]
}

export type ContactsKpisProps = {
  workspaceId: string
  contacts: readonly ListedContact[]
}

export type ContactsTableProps = {
  workspaceId: string
  label: string
  contacts: readonly ListedContact[]
  canCreate: boolean
  canUpdate: boolean
  onCharge: (contactId: string) => void
}

export type ContactTableActionsProps = {
  workspaceId: string
  contact: ListedContact
  canCreate: boolean
  canUpdate: boolean
  onCharge: (contactId: string) => void
}

export type UpcomingCardProps = {
  workspaceId: string
}

export type ChargeChannelsCardProps = {
  workspaceId: string
  canChangeSettings: boolean
}

export type ChargeChannelRowProps = {
  icon: ReactNode
  label: string
  value: string
  action?: ReactNode
}

export type ContactsKpiAmountProps = {
  cents: number
}

export type ContactNameCellProps = {
  workspaceId: string
  contact: ListedContact
}

export type UpcomingBodyProps = {
  upcoming: UseQueryResult<UpcomingContactItem[]>
}

export type ContactReceipt = Awaited<ReturnType<typeof fetchContactReceipts>>['items'][number]

export type ReceiptFacts = {
  chargedOn: ReadonlyMap<string, IsoDate>
  accountNames: ReadonlyMap<string, string>
}

export type ContactDetailDesktopProps = {
  workspaceId: string
  contact: Contact
  menu: ReactNode
  canCharge: boolean
  canRecordReceipt: boolean
  onNewCharge: () => void
  main: ReactNode
  talkTo: ReactNode
}

export type ContactReceiptCardProps = {
  contact: Contact
}

export type ContactPaymentsCardProps = {
  workspaceId: string
  contactId: string
}

export type ContactPaymentsListProps = {
  receipts: readonly ContactReceipt[]
  facts: ReceiptFacts
}

export type ContactEditLinkProps = {
  contactId: string
}

export type ChargeMessagePreviewInput = {
  openItems: readonly ContactOpenItem[]
  until: IsoDate
  contactName: string
  sender: ChargeSender
  text: ChargeText
  receiver: PixReceiver
}

export type ChargeMessagePreview = {
  message: string
  pixPayload: string | null
}

export type ChargeComposeFieldsProps = ChargeComposeProps & {
  until: IsoDate
  onUntilChange: (until: IsoDate) => void
}

export type ChargeMessagePreviewProps = {
  workspaceId: string
  contactName: string
  currentUser: ChargeSender
  openItems: readonly ContactOpenItem[]
  until: IsoDate
}

export type CreatedChargeLayoutProps = {
  alert: ReactNode
  send: ReactNode
  message: ReactNode
  pix: ReactNode
}

export type DialogDismissProps = {
  label: string
  onPress: () => void
}
