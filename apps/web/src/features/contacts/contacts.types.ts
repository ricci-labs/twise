import type { IsoDate, Permission } from '@financas/shared'
import type { ContactChannel } from '@web/components/finance/contact-row'
import type {
  fetchContactBalances,
  fetchContacts,
} from '@web/features/contacts/api/contacts.queries'
import type { CONTACT_SORTS } from '@web/features/contacts/contacts.schemas'

export type Contact = Awaited<ReturnType<typeof fetchContacts>>[number]

export type ContactBalance = Awaited<ReturnType<typeof fetchContactBalances>>[number]

export type ContactSort = (typeof CONTACT_SORTS)[number]

export type ListedContact = {
  id: string
  name: string
  owedCents: number
  overdueCents: number
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
