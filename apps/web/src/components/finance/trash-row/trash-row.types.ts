import type { ReactNode } from 'react'

export type TrashRowProps = {
  name: string
  amount?: ReactNode
  isStacked?: boolean
  icon: string | null
  details: readonly string[]
  note?: string | null
  actionLabel: string
  actionAccessibleLabel: string
  isBusy?: boolean
  onAction: () => void
}
