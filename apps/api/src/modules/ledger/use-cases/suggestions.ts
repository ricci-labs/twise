import { systemClock } from '@api/core/clock'
import type { Clock } from '@api/core/clock.types'
import type { Database, WorkspaceTransaction } from '@api/core/db/db.types'
import { withWorkspace } from '@api/core/db/tx'
import {
  findUsableAccounts,
  selectFrequentDescriptions,
  selectPostingsOfEntries,
  selectRecentDescriptions,
} from '@api/modules/ledger/ledger.repository'
import type {
  EntrySuggestion,
  LatestEntryOfDescription,
  SuggestionLine,
  SuggestionRequester,
} from '@api/modules/ledger/ledger.types'
import { currentWorkspaceDefaults } from '@api/modules/workspaces'
import {
  type AccountKind,
  addDays,
  type EntrySuggestionQuery,
  type EntryTypeWithCategory,
  type FrequentEntryQuery,
  MONEY_ACCOUNT_KINDS,
  todayIn,
} from '@financas/shared'

const SUGGESTION_LIMIT = 3

const FREQUENT_WINDOW_DAYS = 90

const FREQUENT_MIN_USES = 2

const CATEGORY_KIND_OF: Record<EntryTypeWithCategory, AccountKind> = {
  expense: 'expense_category',
  card_purchase: 'expense_category',
  income: 'income_category',
}

const PAYING_KINDS_OF: Record<EntryTypeWithCategory, readonly AccountKind[]> = {
  expense: MONEY_ACCOUNT_KINDS,
  card_purchase: ['credit_card'],
  income: MONEY_ACCOUNT_KINDS,
}

export function listEntrySuggestions(
  db: Database,
  workspaceId: string,
  query: EntrySuggestionQuery,
): Promise<EntrySuggestion[]> {
  return withWorkspace(db, workspaceId, async (tx) => {
    const latest = await selectRecentDescriptions(tx, {
      entryType: query.type,
      search: query.q,
      limit: SUGGESTION_LIMIT,
    })
    return suggestionsOf(tx, query.type, latest)
  })
}

export function listFrequentEntries(
  db: Database,
  { workspaceId, userId }: SuggestionRequester,
  query: FrequentEntryQuery,
  clock: Clock = systemClock,
): Promise<EntrySuggestion[]> {
  return withWorkspace(db, workspaceId, async (tx) => {
    const { timezone } = await currentWorkspaceDefaults(tx)
    const today = todayIn(timezone, clock.now())
    const frequent = await selectFrequentDescriptions(tx, {
      entryType: query.type,
      createdByUserId: userId,
      since: addDays(today, -FREQUENT_WINDOW_DAYS),
      minUses: FREQUENT_MIN_USES,
      limit: query.limit,
    })
    return suggestionsOf(tx, query.type, frequent)
  })
}

async function suggestionsOf(
  tx: WorkspaceTransaction,
  entryType: EntryTypeWithCategory,
  entries: LatestEntryOfDescription[],
): Promise<EntrySuggestion[]> {
  if (entries.length === 0) {
    return []
  }
  const lines = await selectPostingsOfEntries(
    tx,
    entries.map((entry) => entry.id),
  )
  const usable = await usableAccountIds(tx, lines)
  return entries.map((entry) =>
    suggestionOf(
      entry,
      entryType,
      lines.filter((line) => line.entryId === entry.id),
      usable,
    ),
  )
}

async function usableAccountIds(
  tx: WorkspaceTransaction,
  lines: SuggestionLine[],
): Promise<Set<string>> {
  const accountIds = [...new Set(lines.map((line) => line.accountId))]
  const usable = await findUsableAccounts(tx, accountIds)
  return new Set(usable.map((account) => account.id))
}

function suggestionOf(
  entry: LatestEntryOfDescription,
  entryType: EntryTypeWithCategory,
  lines: SuggestionLine[],
  usable: Set<string>,
): EntrySuggestion {
  const categoryLine = lines.find((line) => line.accountKind === CATEGORY_KIND_OF[entryType])
  const payingLines = lines.filter((line) => PAYING_KINDS_OF[entryType].includes(line.accountKind))
  const payingAccountId = payingLines[0]?.accountId
  return {
    description: entry.description,
    categoryId: usableOrNull(categoryLine?.accountId, usable),
    accountId: usableOrNull(payingAccountId, usable),
    paymentMethod: entry.paymentMethod,
    lastAmountCents: Math.abs(payingLines.reduce((sum, line) => sum + line.amountCents, 0)),
    lastUsedOn: entry.occurredOn,
  }
}

function usableOrNull(accountId: string | undefined, usable: Set<string>): string | null {
  return accountId && usable.has(accountId) ? accountId : null
}
