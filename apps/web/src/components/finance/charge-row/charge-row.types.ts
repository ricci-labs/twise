import type { ChargeStatus, IsoDate } from '@financas/shared'
import type { ItemAction } from '@web/components/actions/item-actions'
import type { ChargeChannel } from '@web/components/finance/charge-body'
import type { ReactNode } from 'react'

export type ChargeRowProps = {
  createdOn: IsoDate
  amountCents: number
  status: ChargeStatus
  itemCount: number
  sentVia?: ChargeChannel | null
  hasEmailFailed?: boolean
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  actions?: readonly ItemAction[]
  children?: ReactNode
}
