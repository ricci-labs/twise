import { isMoneyAccountKind } from '@financas/shared'
import { accountsMessages } from '@web/features/accounts/accounts.messages'
import type {
  AccountBalance,
  AccountsData,
  LedgerAccount,
  ListedAccount,
  WorkspaceMember,
} from '@web/features/accounts/accounts.types'
import { formatShortDate } from '@web/lib/format/calendar'

const CREDIT_CARD = 'credit_card'

export function listedAccountsOf(data: AccountsData): ListedAccount[] {
  return data.accounts
    .filter((account) => !account.isSystem)
    .filter((account) => isMoneyAccountKind(account.kind) || account.kind === CREDIT_CARD)
    .map((account) =>
      account.kind === CREDIT_CARD ? listedCard(account, data) : listedMoney(account, data),
    )
}

function listedMoney(account: LedgerAccount, { balances, members }: AccountsData): ListedAccount {
  const kind = accountsMessages.kinds[account.kind as keyof typeof accountsMessages.kinds]
  const owner = ownerOf(account.ownerUserId, members)
  return {
    ...common(account),
    detail: owner ? accountsMessages.detail(kind, owner) : kind,
    amountCents: balanceOf(account.id, balances),
    isCard: false,
    isMoney: true,
  }
}

function listedCard(account: LedgerAccount, { balances, cards }: AccountsData): ListedAccount {
  const card = cards.find((candidate) => candidate.accountId === account.id)
  const invoice = card?.currentInvoice
  return {
    ...common(account),
    detail: invoice
      ? accountsMessages.cardDetail(
          formatShortDate(invoice.closingOn),
          formatShortDate(invoice.dueOn),
        )
      : accountsMessages.kinds.credit_card,
    amountCents: card?.openCents ?? balanceOf(account.id, balances),
    isCard: true,
    isMoney: false,
  }
}

function common(account: LedgerAccount) {
  return {
    id: account.id,
    name: account.name,
    icon: account.icon,
    color: account.color,
    isArchived: account.archivedAt !== null,
  }
}

function ownerOf(
  ownerUserId: string | null,
  members: readonly WorkspaceMember[] | null,
): string | null {
  if (!ownerUserId) {
    return accountsMessages.household
  }
  return members?.find((member) => member.userId === ownerUserId)?.displayName ?? null
}

function balanceOf(accountId: string, balances: readonly AccountBalance[]): number {
  return balances.find((balance) => balance.accountId === accountId)?.naturalBalanceCents ?? 0
}
