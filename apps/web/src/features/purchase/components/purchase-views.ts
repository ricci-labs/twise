import { formatBrl, type IsoDate, MAX_INSTALLMENTS } from '@financas/shared'
import type { ComingMonthBar } from '@web/components/charts/coming-months-bars'
import type { BeforeAfterItem } from '@web/components/display/before-after-tiles'
import type { VerdictTone } from '@web/components/display/verdict'
import { purchaseMessages as messages } from '@web/features/purchase/purchase.messages'
import type {
  PurchaseAccount,
  PurchaseCard,
  PurchaseDraft,
  PurchaseField,
  PurchaseFieldErrors,
  PurchaseImpact,
  PurchaseInsight,
  PurchaseNames,
  RecordSearch,
  RichSentence,
  SimulationQuery,
} from '@web/features/purchase/purchase.types'
import { ApiError } from '@web/lib/api/api-error'
import {
  formatDayMonth,
  formatFullDate,
  formatMonthLabel,
  formatMonthTitle,
  formatRange,
} from '@web/lib/format/calendar'
import { centsOfTypedAmount } from '@web/lib/format/money'

const SINGLE = 1
const NEW_ENTRY = 'new'
const CARD_PURCHASE = 'card_purchase'
const EXPENSE = 'expense'
const FIELD_OF_CODE: Readonly<Record<string, PurchaseField>> = {
  SIMULATION_CARD_INVALID: 'card',
  SIMULATION_ACCOUNT_INVALID: 'account',
  SIMULATION_QUERY_INVALID: 'installments',
}
const ERROR_OF_FIELD = { card: 'card', account: 'account', installments: 'query' } as const
const TONES = { fits: 'ok', tight: 'warn', over: 'alert' } as const

export function firstDraftOf(cards: readonly PurchaseCard[], today: IsoDate): PurchaseDraft {
  const card = cards.find((candidate) => candidate.archivedAt === null)
  return {
    amount: '',
    payment: card ? 'card' : 'account',
    cardAccountId: card?.accountId ?? '',
    installmentCount: SINGLE,
    paidFromAccountId: '',
    occurredOn: today,
  }
}

export function namesOf(
  draft: PurchaseDraft,
  cards: readonly PurchaseCard[],
  accounts: readonly PurchaseAccount[],
): PurchaseNames {
  const names = new Map<string, string>([
    ...accounts.map((account) => [account.id, account.name] as const),
    ...cards.map((card) => [card.accountId, card.name] as const),
  ])
  return {
    cardName: names.get(draft.cardAccountId),
    accountName: names.get(draft.paidFromAccountId),
    nameOf: (id) => (id ? (names.get(id) ?? '') : ''),
  }
}

export function simulationQueryOf(draft: PurchaseDraft): SimulationQuery | null {
  const amountCents = centsOfTypedAmount(draft.amount)
  if (amountCents === null || amountCents <= 0) {
    return null
  }
  const base = {
    amountCents: String(amountCents),
    installmentCount: String(SINGLE),
    occurredOn: draft.occurredOn,
  }
  if (draft.payment === 'account') {
    return draft.paidFromAccountId ? { ...base, paidFromAccountId: draft.paidFromAccountId } : null
  }
  if (!draft.cardAccountId || draft.installmentCount > maxInstallmentsOf(amountCents)) {
    return null
  }
  return {
    ...base,
    cardAccountId: draft.cardAccountId,
    installmentCount: String(draft.installmentCount),
  }
}

export function maxInstallmentsOf(amountCents: number | null): number {
  return amountCents ? Math.min(MAX_INSTALLMENTS, amountCents) : MAX_INSTALLMENTS
}

export function fieldErrorsOf(draft: PurchaseDraft, error: unknown): PurchaseFieldErrors {
  const amountCents = centsOfTypedAmount(draft.amount)
  const hasTooMany =
    draft.payment === 'card' &&
    amountCents !== null &&
    amountCents > 0 &&
    draft.installmentCount > amountCents
  if (hasTooMany) {
    return { installments: messages.errors.tooManyInstallments }
  }
  const code = error instanceof ApiError ? error.code : null
  const field = code ? FIELD_OF_CODE[code] : undefined
  return field ? { [field]: messages.errors[ERROR_OF_FIELD[field]] } : {}
}

export function isFieldError(error: unknown): boolean {
  return error instanceof ApiError && error.code in FIELD_OF_CODE
}

export function recordSearchOf(draft: PurchaseDraft, query: SimulationQuery): RecordSearch {
  const isCard = draft.payment === 'card'
  return {
    entry: NEW_ENTRY,
    entryType: isCard ? CARD_PURCHASE : EXPENSE,
    entryAmount: Number(query.amountCents),
    entryCard: isCard ? draft.cardAccountId : undefined,
    entryInstallments: isCard ? draft.installmentCount : undefined,
    entryAccount: isCard ? undefined : draft.paidFromAccountId,
    entryDate: draft.occurredOn,
  }
}

export function simulationKeyOf(query: SimulationQuery | null): string {
  return JSON.stringify(query)
}

export function verdictOf(impact: PurchaseImpact): {
  tone: VerdictTone
  title: string
  reason: RichSentence
} {
  return {
    tone: TONES[impact.verdict],
    title: messages.verdicts[impact.verdict],
    reason: reasonOf(impact.verdictReason),
  }
}

export function periodItemsOf(impact: PurchaseImpact, names: PurchaseNames): BeforeAfterItem[] {
  const { period } = impact
  const items: BeforeAfterItem[] = [
    {
      label: messages.period.free,
      beforeCents: period.freeToSpendBefore,
      afterCents: period.freeToSpendAfter,
    },
  ]
  if (period.dailyAllowanceBefore !== null && period.dailyAllowanceAfter !== null) {
    items.push({
      label: messages.period.daily(formatDayMonth(period.end as IsoDate)),
      beforeCents: period.dailyAllowanceBefore,
      afterCents: period.dailyAllowanceAfter,
    })
  }
  return [...items, ...paymentItemsOf(impact, names)]
}

export function periodRangeOf(impact: PurchaseImpact): string {
  return formatRange(impact.period.start as IsoDate, impact.period.end as IsoDate)
}

export function elsewhereNoteOf(impact: PurchaseImpact): string | null {
  if (impact.affectsCurrentPeriod || !impact.landsIn) {
    return null
  }
  return messages.period.elsewhere(
    formatRange(impact.landsIn.start as IsoDate, impact.landsIn.end as IsoDate),
  )
}

export function comingBarsOf(impact: PurchaseImpact): ComingMonthBar[] {
  return impact.coming.flatMap((month) =>
    month.percentOfIncomeBefore === null || month.percentOfIncomeAfter === null
      ? []
      : [
          {
            key: month.label,
            label: formatMonthLabel(month.label),
            beforePercent: month.percentOfIncomeBefore,
            afterPercent: month.percentOfIncomeAfter,
          },
        ],
  )
}

export function insightSentenceOf(
  insight: PurchaseInsight,
  names: PurchaseNames,
): RichSentence | null {
  const values = insight.values
  const money = (key: string) => formatBrl(Number(values[key] ?? 0))
  const sentences = messages.insights
  switch (insight.code) {
    case 'period_heavily_committed':
      return {
        template: sentences.period_heavily_committed,
        values: {
          month: formatMonthTitle(String(insight.subject ?? '')),
          percent: Number(values.percentOfIncome ?? 0),
          committed: money('committedCents'),
        },
      }
    case 'card_limit_exceeded':
      return {
        template: sentences.card_limit_exceeded,
        values: { card: names.nameOf(insight.subject), exceeded: money('exceededCents') },
      }
    case 'period_overspent':
      return {
        template: sentences.period_overspent,
        values: { overspent: money('overspentCents') },
      }
    case 'balance_going_negative':
      return {
        template: sentences.balance_going_negative,
        values: {
          account: names.nameOf(insight.subject),
          lowest: money('lowestCents'),
          lowestOn: formatFullDate(String(values.lowestOn ?? '') as IsoDate),
        },
      }
    case 'budget_over':
      return {
        template: sentences.budget_over,
        values: {
          category: names.nameOf(insight.subject),
          spent: money('spentCents'),
          limit: money('limitCents'),
        },
      }
    default:
      return null
  }
}

function paymentItemsOf(impact: PurchaseImpact, names: PurchaseNames): BeforeAfterItem[] {
  const { card, account } = impact
  if (card && card.freeBeforeCents !== null && card.freeAfterCents !== null) {
    return [
      {
        label: messages.period.cardFree(names.cardName ?? ''),
        beforeCents: card.freeBeforeCents,
        afterCents: card.freeAfterCents,
      },
    ]
  }
  if (account) {
    return [
      {
        label: messages.period.accountBalance(names.accountName ?? ''),
        beforeCents: account.balanceTodayBeforeCents,
        afterCents: account.balanceTodayAfterCents,
      },
    ]
  }
  return []
}

function reasonOf(reason: PurchaseImpact['verdictReason']): RichSentence {
  const reasons = messages.reasons
  switch (reason.code) {
    case 'free_left':
      return {
        template: reasons.free_left,
        values: {
          left: formatBrl(reason.leftCents),
          until: formatDayMonth(reason.until as IsoDate),
        },
      }
    case 'card_limit_exceeded':
      return {
        template: reasons.card_limit_exceeded,
        values: { exceeded: formatBrl(reason.exceededCents) },
      }
    case 'period_overspent':
      return {
        template: reasons.period_overspent,
        values: { overspent: formatBrl(reason.overspentCents) },
      }
    default:
      return {
        template: reasons[reason.code],
        values: { month: formatMonthTitle(reason.label), percent: reason.percentOfIncome },
      }
  }
}
