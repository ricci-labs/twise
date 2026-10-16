import {
  type IsoDate,
  type NewRecurrenceRule,
  parseIsoDate,
  type RecurrenceSchedule,
  type RecurringEntryType,
} from '@financas/shared'
import type {
  CategoryKind,
  RecurrenceFormInput,
  RecurrenceFormValues,
} from '@web/features/planning/planning.types'
import { centsOfTypedAmount } from '@web/lib/format/money'

const WEEKLY = 'weekly'
const BUSINESS_DAY = 'businessDay'
const KEEP_THE_DATE = 'keep'
const FIRST_BUSINESS_DAY_SHOWN = '5'
const CARD_PURCHASE = 'card_purchase'
const CATEGORY_KINDS: Record<RecurringEntryType, CategoryKind> = {
  expense: 'expense_category',
  card_purchase: 'expense_category',
  income: 'income_category',
  transfer: 'money',
}

export function blankRecurrence(
  entryType: RecurringEntryType,
  today: IsoDate,
): RecurrenceFormInput {
  return {
    entryType,
    description: '',
    amount: '',
    amountIsEstimate: false,
    sourceAccountId: '',
    categoryAccountId: '',
    frequency: 'monthly',
    interval: 1,
    dayRule: 'day',
    dayOfMonth: String(parseIsoDate(today).day),
    nthBusinessDay: FIRST_BUSINESS_DAY_SHOWN,
    weekendRule: KEEP_THE_DATE,
    startsOn: today,
    hasEnd: false,
    endsOn: '',
  }
}

export function newRuleOf(values: RecurrenceFormValues): NewRecurrenceRule {
  return {
    entryType: values.entryType,
    description: values.description,
    amountCents: centsOfTypedAmount(values.amount) ?? 0,
    amountIsEstimate: values.amountIsEstimate,
    sourceAccountId: values.sourceAccountId,
    categoryAccountId: values.categoryAccountId,
    schedule: scheduleOf(values),
    remindDaysBefore: null,
    autoRecord: false,
  }
}

export function scheduleOf(values: RecurrenceFormInput): RecurrenceSchedule {
  const isWeekly = values.frequency === WEEKLY
  const usesBusinessDay = !isWeekly && values.dayRule === BUSINESS_DAY
  const usesDayOfMonth = !isWeekly && values.dayRule === 'day'
  return {
    frequency: values.frequency,
    interval: values.interval,
    dayOfMonth: usesDayOfMonth ? Number(values.dayOfMonth) : null,
    nthBusinessDay: usesBusinessDay ? Number(values.nthBusinessDay) : null,
    weekendRule: usesBusinessDay ? KEEP_THE_DATE : values.weekendRule,
    startsOn: values.startsOn,
    endsOn: values.hasEnd && values.endsOn !== '' ? values.endsOn : null,
  }
}

export function keepsSourceAccount(from: RecurringEntryType, to: RecurringEntryType): boolean {
  return (from === CARD_PURCHASE) === (to === CARD_PURCHASE)
}

export function keepsCategoryAccount(from: RecurringEntryType, to: RecurringEntryType): boolean {
  return CATEGORY_KINDS[from] === CATEGORY_KINDS[to]
}

export function categoryKindOf(entryType: RecurringEntryType): CategoryKind {
  return CATEGORY_KINDS[entryType]
}
