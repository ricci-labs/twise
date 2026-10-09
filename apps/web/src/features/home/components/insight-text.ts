import { formatBrl } from '@financas/shared'
import { homeMessages } from '@web/features/home/home.messages'
import type {
  InsightAction,
  InsightText,
  NameLookup,
  OverviewInsight,
} from '@web/features/home/home.types'
import { formatFullDate, formatMonthTitle } from '@web/lib/format/calendar'

const sentences = homeMessages.insights.sentences
const actions = homeMessages.insights.actions

export function insightText(insight: OverviewInsight, nameOf: NameLookup): InsightText | null {
  const values = insight.values
  const money = (key: string) => formatBrl(Number(values[key] ?? 0))
  const day = (key: string) => formatFullDate(String(values[key] ?? ''))
  switch (insight.code) {
    case 'period_overspent':
      return text(sentences.period_overspent, { overspent: money('overspentCents') })
    case 'budget_over':
      return text(sentences.budget_over, {
        category: nameOf(insight.subject),
        spent: money('spentCents'),
        limit: money('limitCents'),
      })
    case 'balance_going_negative':
      return text(sentences.balance_going_negative, {
        account: nameOf(insight.subject),
        lowest: money('lowestCents'),
        lowestOn: day('lowestOn'),
      })
    case 'occurrence_overdue':
      return text(
        values.entryType === 'income'
          ? sentences.occurrence_overdue_income
          : sentences.occurrence_overdue_expense,
        {
          description: String(values.description ?? ''),
          dueOn: day('dueOn'),
          amount: money('amountCents'),
        },
      )
    case 'budget_ahead':
      return text(sentences.budget_ahead, {
        category: nameOf(insight.subject),
        spent: money('spentCents'),
        expected: money('expectedCents'),
      })
    case 'period_heavily_committed':
      return text(sentences.period_heavily_committed, {
        month: formatMonthTitle(insight.subject ?? ''),
        percent: Number(values.percentOfIncome ?? 0),
        committed: money('committedCents'),
      })
    case 'contact_overdue':
      return text(sentences.contact_overdue, {
        contact: nameOf(insight.subject),
        overdue: money('overdueCents'),
      })
    case 'variable_income_to_split':
      return text(sentences.variable_income_to_split, { amount: money('amountCents') })
    default:
      return null
  }
}

export function insightAction(insight: OverviewInsight): InsightAction | null {
  switch (insight.code) {
    case 'period_overspent':
      return { label: actions.seeEntries, area: 'entries' }
    case 'budget_over':
    case 'budget_ahead':
      return { label: actions.seeBudget, area: 'planning' }
    case 'balance_going_negative':
      return { label: actions.seeForecast, area: '', hash: 'forecast' }
    case 'occurrence_overdue':
      return { label: actions.record, area: 'planning' }
    case 'period_heavily_committed':
      return { label: actions.seeComingMonths, area: '', hash: 'coming-months' }
    case 'contact_overdue':
      return { label: actions.charge, area: 'contacts' }
    case 'variable_income_to_split':
      return { label: actions.seeSuggestion, area: 'commission-split' }
    default:
      return null
  }
}

function text(template: string, values: InsightText['values']): InsightText {
  return { template, values }
}
