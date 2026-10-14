import type { Permission } from '@financas/shared'
import type {
  fetchAccounts,
  fetchAccountsSummary,
  fetchBalances,
  fetchCards,
  fetchMembers,
} from '@web/features/accounts/api/accounts.queries'

export type LedgerAccount = Awaited<ReturnType<typeof fetchAccounts>>[number]

export type AccountBalance = Awaited<ReturnType<typeof fetchBalances>>[number]

export type AccountsSummary = Awaited<ReturnType<typeof fetchAccountsSummary>>

export type CardSummary = Awaited<ReturnType<typeof fetchCards>>[number]

export type WorkspaceMember = Awaited<ReturnType<typeof fetchMembers>>[number]

export type AccountAction = 'archive' | 'unarchive' | 'delete' | 'restore'

export type AccountParam = { param: { workspaceId: string; accountId: string } }

export type AccountActionRequest = {
  action: AccountAction
  accountId: string
}

export type AccountsPageProps = {
  workspaceId: string
  permissions: readonly Permission[]
}

export type AccountsAreaHeaderProps = {
  workspaceId: string
  current: 'accounts' | 'categories'
  canSeeTrash: boolean
}

export type AccountsSummaryCardsProps = {
  summary: AccountsSummary
  cardNames: ReadonlyMap<string, string>
}

export type ListedAccount = {
  id: string
  name: string
  icon: string | null
  color: string | null
  detail: string
  amountCents: number
  isCard: boolean
  isMoney: boolean
  isArchived: boolean
}

export type AccountsListsProps = {
  workspaceId: string
  permissions: readonly Permission[]
  accounts: readonly ListedAccount[]
}

export type AccountRowActionsProps = {
  workspaceId: string
  permissions: readonly Permission[]
  account: ListedAccount
}

export type AccountsData = {
  accounts: readonly LedgerAccount[]
  balances: readonly AccountBalance[]
  cards: readonly CardSummary[]
  members: readonly WorkspaceMember[] | null
}

export type AccountActionHandlers = {
  canUpdate: boolean
  canDelete: boolean
  archive: () => void
  unarchive: () => void
  remove: () => void
}

export type AccountsBodyProps = {
  workspaceId: string
  permissions: readonly Permission[]
}

export type AccountsLoadedProps = AccountsBodyProps & {
  data: AccountsData
  summary: AccountsSummary
}
