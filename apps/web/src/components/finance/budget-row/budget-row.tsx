import { ProgressBar } from '@web/components/charts/progress-bar'
import { Amount } from '@web/components/display/amount'
import { CategoryArt } from '@web/components/display/category-art'
import { budgetRowMessages as messages } from '@web/components/finance/budget-row/budget-row.messages'
import type {
  BudgetChildrenProps,
  BudgetRowProps,
} from '@web/components/finance/budget-row/budget-row.types'
import {
  budgetChildrenVariants,
  budgetChildVariants,
  budgetMoreVariants,
  budgetRowAmountVariants,
  budgetRowBodyVariants,
  budgetRowHeadVariants,
  budgetRowNameVariants,
  budgetRowStatusVariants,
  budgetRowVariants,
} from '@web/components/finance/budget-row/budget-row.variants'
import { TwiseIcon } from '@web/components/icons/twise-icon'

const FULL = 100
const STATUS_ICONS = {
  within: { name: 'ok', tone: 'success' },
  ahead: { name: 'warn', tone: 'warning' },
  over: { name: 'alert', tone: 'danger' },
} as const

export function BudgetRow({
  name,
  art,
  spentCents,
  limitCents,
  markPercent,
  status,
  statusText,
  subcategories = [],
  moreLabel = messages.more,
  moreHint,
  onMore,
  actions,
}: BudgetRowProps) {
  const icon = STATUS_ICONS[status]
  return (
    <li data-slot="budget-row" className={budgetRowVariants()}>
      <CategoryArt name={art.name} icon={art.icon} size="md" />
      <div className={budgetRowBodyVariants()}>
        <div className={budgetRowHeadVariants()}>
          <span className={budgetRowNameVariants()}>{name}</span>
          <span className={budgetRowAmountVariants()}>
            <strong>
              <Amount cents={spentCents} size="inherit" />
            </strong>{' '}
            {messages.of} <Amount cents={limitCents} size="inherit" />
          </span>
        </div>
        <ProgressBar
          percent={limitCents > 0 ? (spentCents / limitCents) * FULL : 0}
          markPercent={markPercent}
          tone={status}
        />
        <span className={budgetRowStatusVariants({ status })}>
          <TwiseIcon name={icon.name} tone={icon.tone} size="sm" />
          {statusText}
        </span>
        {subcategories.length > 0 && (
          <BudgetChildren
            items={subcategories}
            moreLabel={moreLabel}
            moreHint={moreHint}
            onMore={onMore}
          />
        )}
      </div>
      {actions}
    </li>
  )
}

function BudgetChildren({ items, moreLabel, moreHint, onMore }: BudgetChildrenProps) {
  const [first, ...rest] = items
  if (!first) {
    return null
  }
  return (
    <span className={budgetChildrenVariants()}>
      <span className={budgetChildVariants()}>
        {first.label}{' '}
        <strong>
          <Amount cents={first.amountCents} size="inherit" />
        </strong>
      </span>
      {rest.length > 0 && (
        <button type="button" onClick={onMore} className={budgetMoreVariants()}>
          {moreLabel(rest.length)}
          {moreHint && <span className="sr-only"> {moreHint}</span>}
        </button>
      )}
    </span>
  )
}
