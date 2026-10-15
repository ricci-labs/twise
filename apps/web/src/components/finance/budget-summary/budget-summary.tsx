import { ProgressBar } from '@web/components/charts/progress-bar'
import { Amount } from '@web/components/display/amount'
import { budgetSummaryMessages as messages } from '@web/components/finance/budget-summary/budget-summary.messages'
import type { BudgetSummaryProps } from '@web/components/finance/budget-summary/budget-summary.types'
import {
  budgetSummaryAmountsVariants,
  budgetSummaryLegendVariants,
  budgetSummaryLimitVariants,
  budgetSummaryMarkVariants,
  budgetSummarySpentVariants,
  budgetSummaryTitleVariants,
  budgetSummaryVariants,
} from '@web/components/finance/budget-summary/budget-summary.variants'

const FULL = 100

export function BudgetSummary({
  title,
  spentCents,
  limitCents,
  markPercent,
  legend,
}: BudgetSummaryProps) {
  return (
    <section data-slot="budget-summary" aria-label={title} className={budgetSummaryVariants()}>
      <p className={budgetSummaryTitleVariants()}>{title}</p>
      <p className={budgetSummaryAmountsVariants()}>
        <Amount cents={spentCents} size="inherit" className={budgetSummarySpentVariants()} />
        <span className={budgetSummaryLimitVariants()}>
          {messages.of} <Amount cents={limitCents} size="inherit" />
        </span>
      </p>
      <ProgressBar
        percent={limitCents > 0 ? (spentCents / limitCents) * FULL : 0}
        markPercent={markPercent}
        thickness="lg"
      />
      <p className={budgetSummaryLegendVariants()}>
        <span aria-hidden="true" className={budgetSummaryMarkVariants()} />
        {legend}
      </p>
    </section>
  )
}
