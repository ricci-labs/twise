import type { ReactElement } from 'react'

export type BudgetStatus = 'within' | 'ahead' | 'over'

export type BudgetChild = {
  label: string
  amountCents: number
}

export type BudgetRowProps = {
  name: string
  art: { name: string; icon: string | null }
  spentCents: number
  limitCents: number
  markPercent: number
  status: BudgetStatus
  statusText: string
  subcategories?: readonly BudgetChild[]
  moreLabel?: (count: number) => string
  moreHint?: string
  onMore?: () => void
  actions?: ReactElement
}

export type BudgetChildrenProps = {
  items: readonly BudgetChild[]
  moreLabel: (count: number) => string
  moreHint?: string
  onMore?: () => void
}
