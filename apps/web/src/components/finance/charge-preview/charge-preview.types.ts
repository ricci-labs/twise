import type { IsoDate } from '@financas/shared'

export type ChargePreviewItem = {
  key: string
  description: string
  dueOn: IsoDate
  isOverdue: boolean
  amountCents: number
}

export type ChargePreviewProps = {
  items: readonly ChargePreviewItem[]
  totalCents: number
  className?: string
}
