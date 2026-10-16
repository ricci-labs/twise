import { formatBrl } from '@financas/shared'
import type { OccurrenceBadge } from '@web/components/finance/occurrence-row'
import { planningMessages } from '@web/features/planning/planning.messages'
import type {
  ListedOccurrence,
  OccurrenceContext,
  OccurrenceGroupKey,
  OccurrenceGroupView,
  OccurrenceList,
  OccurrenceRowView,
  OccurrenceSummaryTiles,
} from '@web/features/planning/planning.types'
import { formatShortDate } from '@web/lib/format/calendar'

const messages = planningMessages.occurrences
const GROUP_ORDER: readonly OccurrenceGroupKey[] = ['overdue', 'upcoming', 'matched', 'skipped']
const DIRECTIONS = {
  expense: 'out',
  card_purchase: 'out',
  income: 'in',
  transfer: 'neutral',
} as const

const MATCHED_BADGES = {
  expense: 'paid',
  card_purchase: 'paid',
  income: 'received',
  transfer: 'done',
} as const satisfies Record<ListedOccurrence['entryType'], OccurrenceBadge>

const PAID_ON = {
  expense: messages.paidOn,
  card_purchase: messages.paidOn,
  income: messages.receivedOn,
  transfer: messages.doneOn,
} as const satisfies Record<ListedOccurrence['entryType'], (date: string) => string>

export function occurrenceGroupsOf(
  { items, totals }: OccurrenceList,
  context: OccurrenceContext,
): OccurrenceGroupView[] {
  return GROUP_ORDER.map((key) => ({
    key,
    title: messages.groups[key],
    count: totals.groups[key],
    rows: sortedFor(
      key,
      items.filter((item) => groupOf(item) === key),
    ).map((item) => rowOf(item, context)),
  })).filter((group) => group.rows.length > 0)
}

export function summaryTilesOf({ totals }: OccurrenceList): OccurrenceSummaryTiles {
  return [
    {
      label: messages.toPay,
      amountCents: totals.toPay.amountCents,
      note: noteOf(messages.bills(totals.toPay.count), totals.toPay.overdueCount),
    },
    {
      label: messages.toReceive,
      amountCents: totals.toReceive.amountCents,
      tone: 'income',
      note: noteOf(messages.incomes(totals.toReceive.count), totals.toReceive.overdueCount),
    },
  ]
}

function noteOf(count: string, overdueCount: number): string {
  return overdueCount > 0 ? `${count}, ${messages.overdueNote(overdueCount)}` : count
}

function groupOf(item: ListedOccurrence): OccurrenceGroupKey {
  if (item.status === 'matched' || item.status === 'skipped') {
    return item.status
  }
  return item.isOverdue ? 'overdue' : 'upcoming'
}

function sortedFor(key: OccurrenceGroupKey, items: ListedOccurrence[]): ListedOccurrence[] {
  const byDate = [...items].sort((left, right) => left.dueOn.localeCompare(right.dueOn))
  return key === 'matched' ? byDate.reverse() : byDate
}

function rowOf(item: ListedOccurrence, context: OccurrenceContext): OccurrenceRowView {
  const isMatched = item.status === 'matched'
  return {
    id: item.id,
    dueOn: item.dueOn,
    description: item.description,
    detail: detailOf(item, context),
    badge: badgeOf(item, context),
    amountCents: isMatched ? (item.paidCents ?? item.amountCents) : item.amountCents,
    direction: DIRECTIONS[item.entryType],
    isEstimate: item.amountIsEstimate && !isMatched,
    isDone: isMatched || item.status === 'skipped',
    isOverdue: item.isOverdue,
  }
}

function badgeOf(item: ListedOccurrence, context: OccurrenceContext): OccurrenceBadge | undefined {
  if (item.status === 'skipped') {
    return 'skipped'
  }
  if (item.status === 'matched') {
    return MATCHED_BADGES[item.entryType]
  }
  if (item.isOverdue) {
    return 'overdue'
  }
  return item.dueOn === context.today ? 'today' : undefined
}

function detailOf(item: ListedOccurrence, context: OccurrenceContext): string {
  const account = occurrenceAccountOf(item, context)
  if (item.status === 'matched') {
    return [account, paidPartOf(item)].filter(Boolean).join(messages.separator)
  }
  if (item.status === 'skipped') {
    const name = item.skippedByUserId && context.memberNames.get(item.skippedByUserId)
    return [account, name ? messages.skippedBy(name) : messages.skipped].join(messages.separator)
  }
  if (item.entryType === 'transfer') {
    return account
  }
  return [account, pathOf(item.categoryAccountId, context)].filter(Boolean).join(messages.separator)
}

export function occurrenceAccountOf(item: ListedOccurrence, context: OccurrenceContext): string {
  const source = context.accounts.get(item.sourceAccountId)?.name ?? ''
  if (item.entryType !== 'transfer') {
    return source
  }
  const target = context.accounts.get(item.categoryAccountId)?.name ?? ''
  return `${source}${messages.arrow}${target}`
}

function pathOf(accountId: string, context: OccurrenceContext): string | undefined {
  const category = context.accounts.get(accountId)
  if (!category) {
    return undefined
  }
  const parent = category.parentId ? context.accounts.get(category.parentId) : undefined
  return parent ? `${parent.name}${messages.path}${category.name}` : category.name
}

function paidPartOf(item: ListedOccurrence): string | undefined {
  if (!item.paidOn) {
    return undefined
  }
  const date = formatShortDate(item.paidOn)
  const when = PAID_ON[item.entryType](date)
  const isOffPlan = item.amountIsEstimate && item.paidCents !== item.amountCents
  return isOffPlan ? `${when} ${messages.planned(formatBrl(item.amountCents))}` : when
}
