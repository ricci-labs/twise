import { isMoneyAccountKind, todayIn } from '@financas/shared'
import { accountsMessages } from '@web/features/accounts/accounts.messages'
import type {
  LedgerAccount,
  TrashedAccount,
  TrashedItem,
  TrashedParent,
  WorkspaceMember,
} from '@web/features/accounts/accounts.types'
import { formatFullDate } from '@web/lib/format/calendar'

const messages = accountsMessages.trashPage
const TIME_ZONE = 'America/Sao_Paulo'
const CREDIT_CARD = 'credit_card'
const CATEGORY_KINDS: readonly string[] = ['expense_category', 'income_category']

export function trashedItemsOf(
  trash: readonly TrashedAccount[],
  accounts: readonly LedgerAccount[],
  members: readonly WorkspaceMember[] | null,
): TrashedItem[] {
  return [...trash]
    .sort((first, second) => String(second.deletedAt).localeCompare(String(first.deletedAt)))
    .map((account) => {
      const parent = parentOf(account.parentId, trash, accounts)
      return {
        id: account.id,
        name: account.name,
        icon: account.icon,
        kindLine: parent ? messages.inside(kindOf(account), parent.name) : kindOf(account),
        deletedLine: deletedLineOf(account, members),
        reason: account.deleteReason ? messages.reason(account.deleteReason) : null,
        parent,
        restoredMessage: restoredMessageOf(account.kind),
        isListedInAccounts: account.kind === CREDIT_CARD || isMoneyAccountKind(account.kind),
      }
    })
}

function kindOf(account: TrashedAccount): string {
  const kinds: Readonly<Record<string, string>> = { ...accountsMessages.kinds, ...messages.kinds }
  return kinds[account.kind] ?? account.kind
}

function parentOf(
  parentId: string | null,
  trash: readonly TrashedAccount[],
  accounts: readonly LedgerAccount[],
): TrashedParent | null {
  if (!parentId) {
    return null
  }
  const trashed = trash.find((candidate) => candidate.id === parentId)
  const parent = trashed ?? accounts.find((candidate) => candidate.id === parentId)
  if (!parent) {
    return null
  }
  return {
    id: parent.id,
    name: parent.name,
    isInTrash: Boolean(trashed),
    isCategory: CATEGORY_KINDS.includes(parent.kind),
  }
}

function deletedLineOf(account: TrashedAccount, members: readonly WorkspaceMember[] | null) {
  const date = formatFullDate(todayIn(TIME_ZONE, new Date(account.deletedAt)))
  const deleted = messages.deleted(date, account.kind === CREDIT_CARD)
  const by = members?.find((member) => member.userId === account.deletedByUserId)?.displayName
  return by ? messages.deletedBy(deleted, by) : deleted
}

function restoredMessageOf(kind: string): string {
  if (kind === CREDIT_CARD) {
    return messages.restored.card
  }
  return CATEGORY_KINDS.includes(kind) ? messages.restored.category : messages.restored.account
}
