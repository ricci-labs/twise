import { addDays, formatBrl, type IsoDate, todayIn } from '@financas/shared'
import type { AuditChangeRow } from '@web/components/display/audit-change'
import type { AuditSentencePart } from '@web/components/display/audit-event-row'
import { auditMessages as messages } from '@web/features/audit/audit.messages'
import type {
  AuditDay,
  AuditEvent,
  AuditFieldChange,
  AuditFieldValue,
} from '@web/features/audit/audit.types'
import { formatDayMonth, formatFullDate, formatShortWeekday } from '@web/lib/format/calendar'
import { formatDay, formatTime } from '@web/lib/format/date'

const TIME_ZONE = 'America/Sao_Paulo'
const REFERENCE_LENGTH = 8
const ENTRIES = 'journal_entries'
const ACCOUNTS = 'ledger_accounts'
const MEMBERSHIPS = 'memberships'
const CATEGORY_KINDS = new Set(['income_category', 'expense_category'])
const AMOUNT_ACTIONS = new Set(['create', 'delete', 'restore'])
const WHOLE_ACTIONS = new Set(['create', 'delete'])
const SEPARATOR = ' · '

export function auditDaysOf(events: readonly AuditEvent[], today: IsoDate): AuditDay[] {
  const days = new Map<IsoDate, AuditEvent[]>()
  for (const event of events) {
    const date = dayOf(event.at)
    days.set(date, [...(days.get(date) ?? []), event])
  }
  return [...days].map(([date, dayEvents]) => ({
    date,
    title: dayTitleOf(date, today),
    events: dayEvents,
  }))
}

export function auditSentenceOf(event: AuditEvent): AuditSentencePart[] {
  return [...auditCoreOf(event), ...suffixOf(event)]
}

export function auditTitleOf(event: AuditEvent): string {
  return auditCoreOf(event)
    .map((part) => part.text)
    .join('')
}

export function auditRowDetailOf(event: AuditEvent): string {
  const reference = referenceOf(event)
  return [
    formatTime(event.at, TIME_ZONE),
    event.area && messages.areas[event.area],
    reference && messages.reference(reference),
  ]
    .filter(Boolean)
    .join(SEPARATOR)
}

export function auditChangeDetailOf(event: AuditEvent, today: IsoDate): string {
  const date = dayOf(event.at)
  const day = shortDayOf(date, today)
  return `${day}, ${formatTime(event.at, TIME_ZONE)}${SEPARATOR}${messages.sources[event.source]}`
}

export function auditChangeRowsOf(event: AuditEvent): AuditChangeRow[] {
  const marks = !WHOLE_ACTIONS.has(event.action)
  return event.changes.map((change) => ({
    label: messages.fields[change.field],
    before: valueText(change, change.before),
    after: valueText(change, change.after),
    isChanged: marks && change.changed,
  }))
}

export function canOpenItem(event: AuditEvent): boolean {
  return event.tableName === ENTRIES && event.action !== 'delete'
}

export function referenceOf(event: AuditEvent): string | null {
  return event.traceId ? event.traceId.slice(0, REFERENCE_LENGTH) : null
}

function auditCoreOf(event: AuditEvent): AuditSentencePart[] {
  const actor = { text: event.actor?.name ?? messages.automatic, isStrong: true }
  const membership = event.tableName === MEMBERSHIPS ? membershipPartsOf(event) : null
  if (membership) {
    return [actor, ...membership]
  }
  const label = event.entityLabel
    ? [{ text: ' ' }, { text: event.entityLabel, isStrong: true }]
    : []
  return [actor, { text: ` ${verbOf(event)} ${nounOf(event)}` }, ...label]
}

function membershipPartsOf(event: AuditEvent): AuditSentencePart[] | null {
  const person = { text: event.entityLabel ?? messages.automatic, isStrong: true }
  const role = changeOf(event, 'roleId')
  if (event.action === 'update' && role?.changed) {
    const roleName = valueText(role, role.after)
    return [
      { text: ` ${messages.roleChanged} ` },
      person,
      { text: messages.roleChangedTo(roleName) },
    ]
  }
  if (event.action === 'create') {
    return [{ text: ` ${messages.memberAdded} ` }, person, { text: messages.memberAddedEnd }]
  }
  if (event.action === 'delete') {
    return [{ text: ` ${messages.memberRemoved} ` }, person, { text: messages.memberRemovedEnd }]
  }
  return null
}

function suffixOf(event: AuditEvent): AuditSentencePart[] {
  if (event.tableName === MEMBERSHIPS && event.action !== 'update') {
    return []
  }
  if (event.tableName === ENTRIES && AMOUNT_ACTIONS.has(event.action)) {
    const amount = changeOf(event, 'amountCents')
    const cents = amount?.after ?? amount?.before
    return typeof cents === 'number' ? [{ text: messages.amount(formatBrl(cents)) }] : []
  }
  const changed = event.action === 'update' ? event.changes.filter((change) => change.changed) : []
  const [only] = changed
  if (changed.length !== 1 || !only || only.field === 'roleId') {
    return []
  }
  const label = messages.fields[only.field]
  return [
    {
      text: messages.changedFrom(label, valueText(only, only.before), valueText(only, only.after)),
    },
  ]
}

function verbOf(event: AuditEvent): string {
  return event.tableName === ENTRIES && event.action === 'create'
    ? messages.recorded
    : messages.verbs[event.action]
}

function nounOf(event: AuditEvent): string {
  if (event.tableName === ACCOUNTS) {
    const kind = changeOf(event, 'kind')
    const value = kind?.after ?? kind?.before
    if (typeof value === 'string' && CATEGORY_KINDS.has(value)) {
      return messages.nouns.categories ?? ''
    }
  }
  return messages.nouns[event.tableName] ?? ''
}

function changeOf(event: AuditEvent, field: string): AuditFieldChange | undefined {
  return event.changes.find((change) => change.field === field)
}

function valueText(change: AuditFieldChange, value: AuditFieldValue): string {
  if (value === null) {
    return messages.noValue
  }
  if (typeof value === 'object') {
    return value.parentName ? `${value.parentName} › ${value.name}` : value.name
  }
  if (typeof value === 'boolean') {
    return value ? messages.yes : messages.no
  }
  return scalarText(change.kind, value)
}

function scalarText(kind: AuditFieldChange['kind'], value: string | number): string {
  if (kind === 'money' && typeof value === 'number') {
    return formatBrl(value)
  }
  if (kind === 'date') {
    return formatFullDate(String(value) as IsoDate)
  }
  if (kind === 'datetime') {
    return `${formatDay(String(value), TIME_ZONE)} ${formatTime(String(value), TIME_ZONE)}`
  }
  if (kind === 'choice') {
    return messages.choices[String(value)] ?? String(value)
  }
  return String(value)
}

function dayOf(instant: string): IsoDate {
  return todayIn(TIME_ZONE, new Date(instant))
}

function dayTitleOf(date: IsoDate, today: IsoDate): string {
  if (date === today) {
    return messages.today
  }
  if (date === addDays(today, -1)) {
    return messages.yesterday(formatDayMonth(date))
  }
  return messages.weekday(formatShortWeekday(date), formatDayMonth(date))
}

function shortDayOf(date: IsoDate, today: IsoDate): string {
  if (date === today) {
    return messages.today
  }
  if (date === addDays(today, -1)) {
    return messages.yesterdayShort
  }
  return formatFullDate(date)
}
