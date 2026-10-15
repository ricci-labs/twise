import type { IsoDate } from '@financas/shared'
import { dayOfWeek, parseIsoDate } from '@financas/shared'
import { planningMessages } from '@web/features/planning/planning.messages'
import type {
  ListedRecurrence,
  OccurrenceSummaryTiles,
  RecurrenceContext,
  RecurrenceGroupKey,
  RecurrenceGroupView,
  RecurrenceList,
  RecurrenceRowView,
} from '@web/features/planning/planning.types'
import { formatShortDate, formatShortDateWithYear } from '@web/lib/format/calendar'

const messages = planningMessages.recurrences
const words = messages.every
const SEPARATOR = ' · '
const PATH = ' › '
const ARROW = ' → '
const SUNDAY = 0
const SATURDAY = 6
const GROUP_ORDER: readonly RecurrenceGroupKey[] = ['bills', 'income', 'transfers']
const GROUP_OF = {
  expense: 'bills',
  card_purchase: 'bills',
  income: 'income',
  transfer: 'transfers',
} as const satisfies Record<ListedRecurrence['entryType'], RecurrenceGroupKey>
const DIRECTIONS = {
  expense: 'out',
  card_purchase: 'out',
  income: 'in',
  transfer: 'neutral',
} as const

export function recurrenceGroupsOf(
  { items }: RecurrenceList,
  context: RecurrenceContext,
): RecurrenceGroupView[] {
  return GROUP_ORDER.map((key) => ({
    key,
    title: messages.groups[key],
    rows: items
      .filter((item) => GROUP_OF[item.entryType] === key)
      .map((item) => rowOf(item, context)),
  })).filter((group) => group.rows.length > 0)
}

export function recurrenceTilesOf({ items, summary }: RecurrenceList): OccurrenceSummaryTiles {
  const averaged = summary.bills.includesAveraged ? `; ${messages.averaged}` : ''
  return [
    {
      label: messages.bills,
      amountCents: summary.bills.monthlyCents,
      isEstimate: summary.bills.includesEstimate,
      note: `${messages.billsCount(summary.bills.count)}${averaged}`,
    },
    {
      label: messages.income,
      amountCents: summary.income.monthlyCents,
      tone: 'income',
      note: leftOutNoteOf(items, summary.income.leftOutEstimateCount),
    },
  ]
}

export function scheduleWordsOf(schedule: ListedRecurrence['schedule']): string {
  if (schedule.frequency === 'weekly') {
    return weeklyWords(schedule.startsOn, schedule.interval)
  }
  if (schedule.frequency === 'yearly') {
    return yearlyWords(schedule)
  }
  return monthlyWords(schedule)
}

function weeklyWords(startsOn: IsoDate, interval: number): string {
  const weekdayIndex = dayOfWeek(startsOn)
  const weekday = messages.weekdays[weekdayIndex] ?? ''
  const isWeekend = weekdayIndex === SUNDAY || weekdayIndex === SATURDAY
  if (interval > 1) {
    return words.weeks(interval, weekday, isWeekend)
  }
  return isWeekend ? words.weekendDay(weekday) : words.weekday(weekday)
}

function monthlyWords(schedule: ListedRecurrence['schedule']): string {
  const { interval, nthBusinessDay } = schedule
  if (nthBusinessDay !== null) {
    return interval > 1
      ? words.monthsOnBusinessDay(interval, nthBusinessDay)
      : words.businessDay(nthBusinessDay)
  }
  const day = dayOf(schedule)
  return interval > 1 ? words.monthsOnDay(interval, day) : words.day(day)
}

function yearlyWords(schedule: ListedRecurrence['schedule']): string {
  const month = messages.months[parseIsoDate(schedule.startsOn).month - 1] ?? ''
  if (schedule.nthBusinessDay !== null) {
    return words.yearOnBusinessDay(schedule.nthBusinessDay, month)
  }
  const day = dayOf(schedule)
  return schedule.interval > 1
    ? words.yearsOn(schedule.interval, day, month)
    : words.yearOn(day, month)
}

function dayOf(schedule: ListedRecurrence['schedule']): number {
  return schedule.dayOfMonth ?? parseIsoDate(schedule.startsOn).day
}

function rowOf(item: ListedRecurrence, context: RecurrenceContext): RecurrenceRowView {
  return {
    id: item.id,
    description: item.description,
    detail: detailOf(item, context),
    next: nextOf(item, context.today),
    art: artOf(item, context),
    amountCents: item.amountCents,
    direction: DIRECTIONS[item.entryType],
    isEstimate: item.amountIsEstimate,
  }
}

function detailOf(item: ListedRecurrence, context: RecurrenceContext): string {
  const source = context.accounts.get(item.sourceAccountId)?.name ?? ''
  const schedule = scheduleWordsOf(item.schedule)
  if (item.entryType === 'transfer') {
    const target = context.accounts.get(item.categoryAccountId)?.name ?? ''
    return [schedule, `${source}${ARROW}${target}`].join(SEPARATOR)
  }
  const variable = item.entryType === 'income' && item.amountIsEstimate ? messages.variable : ''
  return [schedule, source, pathOf(item.categoryAccountId, context), variable]
    .filter(Boolean)
    .join(SEPARATOR)
}

function pathOf(accountId: string, context: RecurrenceContext): string | undefined {
  const category = context.accounts.get(accountId)
  if (!category) {
    return undefined
  }
  const parent = category.parentId ? context.accounts.get(category.parentId) : undefined
  return parent ? `${parent.name}${PATH}${category.name}` : category.name
}

function nextOf(item: ListedRecurrence, today: IsoDate): RecurrenceRowView['next'] {
  if (!item.nextOn) {
    return undefined
  }
  if (item.nextIsOverdue) {
    return { label: messages.overdueSince(formatShortDate(item.nextOn)), tone: 'overdue' }
  }
  if (item.nextOn === today) {
    return { label: messages.dueToday, tone: 'today' }
  }
  const isThisYear = parseIsoDate(item.nextOn).year === parseIsoDate(today).year
  const date = isThisYear ? formatShortDate(item.nextOn) : formatShortDateWithYear(item.nextOn)
  return { label: messages.next(date), tone: 'neutral' }
}

function artOf(item: ListedRecurrence, context: RecurrenceContext): RecurrenceRowView['art'] {
  if (item.entryType === 'transfer') {
    return { name: item.description, icon: 'transfer' }
  }
  const category = context.accounts.get(item.categoryAccountId)
  const parent = category?.parentId ? context.accounts.get(category.parentId) : undefined
  return {
    name: (parent ?? category)?.name ?? item.description,
    icon: category?.icon ?? parent?.icon ?? null,
  }
}

function leftOutNoteOf(items: readonly ListedRecurrence[], count: number): string | undefined {
  if (count === 0) {
    return undefined
  }
  const [only] = items.filter((item) => item.entryType === 'income' && item.amountIsEstimate)
  return count === 1 && only ? messages.leftOut(only.description) : messages.leftOutMany
}
