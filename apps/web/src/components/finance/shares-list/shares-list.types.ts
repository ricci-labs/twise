import type { MoneyInputChange } from '@web/components/inputs/money-input'

export type ShareRow = {
  key: string
  contactName: string
  amountText: string
  isInvalid?: boolean
}

export type SharesListProps = {
  rows: readonly ShareRow[]
  yoursName: string
  yoursCents: number | null
  error?: string
  canAdd: boolean
  onAmountChange: (key: string, change: MoneyInputChange) => void
  onAmountBlur?: (key: string) => void
  onRemove: (key: string) => void
  onAdd: () => void
  onHalf: () => void
  onEqually: () => void
}

export type SharesCollapsedProps = {
  onOpen: () => void
}
