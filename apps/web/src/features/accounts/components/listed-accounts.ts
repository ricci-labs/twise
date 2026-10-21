import { BENEFIT_ACCOUNT_KIND, isMoneyAccountKind } from '@financas/shared'
import { accountsMessages } from '@web/features/accounts/accounts.messages'
import type {
  AccountBalance,
  AccountsData,
  CardSummary,
  LedgerAccount,
  ListedAccount,
  WorkspaceMember,
} from '@web/features/accounts/accounts.types'
import { formatShortDate } from '@web/lib/format/calendar'

const CREDIT_CARD = 'credit_card'
const CARD_ICON = 'card'

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
    kindLabel: kind,
    ownerLabel: owner ? capitalized(owner) : null,
    amountCents: balanceOf(account.id, balances),
    isCard: false,
    isMoney: account.kind !== BENEFIT_ACCOUNT_KIND,
    isBenefit: account.kind === BENEFIT_ACCOUNT_KIND,
  }
}

function listedCard(account: LedgerAccount, { balances, cards }: AccountsData): ListedAccount {
  const card = cards.find((candidate) => candidate.accountId === account.id)
  const invoice = card?.currentInvoice
  return {
    ...common(account),
    icon: account.icon ?? CARD_ICON,
    detail: invoice
      ? accountsMessages.cardDetail(
          formatShortDate(invoice.closingOn),
          formatShortDate(invoice.dueOn),
        )
      : accountsMessages.kinds.credit_card,
    kindLabel: invoice
      ? accountsMessages.cardCycle(
          formatShortDate(invoice.closingOn),
          formatShortDate(invoice.dueOn),
        )
      : accountsMessages.kinds.credit_card,
    ownerLabel: null,
    amountCents: card?.openCents ?? balanceOf(account.id, balances),
    isCard: true,
    isMoney: false,
    isBenefit: false,
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

export function listedCardOf(card: CardSummary): ListedAccount {
  return {
    id: card.accountId,
    name: card.name,
    icon: card.icon ?? CARD_ICON,
    color: card.color,
    detail: '',
    kindLabel: accountsMessages.kinds.credit_card,
    ownerLabel: null,
    amountCents: card.openCents,
    isCard: true,
    isMoney: false,
    isBenefit: false,
    isArchived: card.archivedAt !== null,
  }
}

function capitalized(text: string): string {
  return text.charAt(0).toLocaleUpperCase('pt-BR') + text.slice(1)
}
