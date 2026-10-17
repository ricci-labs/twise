import type { IsoDate } from '@financas/shared'

export type NothingToChargeNext = {
  dueOn: IsoDate
  amountCents: number
}

export type NothingToChargeProps = {
  chargedOn?: IsoDate | null
  next?: NothingToChargeNext | null
  onIncludeNext?: () => void
  className?: string
}
