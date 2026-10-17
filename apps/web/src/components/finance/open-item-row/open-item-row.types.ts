import type { IsoDate } from '@financas/shared'
import type { ReactElement, ReactNode } from 'react'

export type OpenItemRowLinkProps = {
  className?: string
  children?: ReactNode
}

export type OpenItemRowProps = {
  dueOn: IsoDate
  description: string
  detail: string
  amountCents: number
  isOverdue?: boolean
  chargedOn?: IsoDate | null
  link?: ReactElement<OpenItemRowLinkProps>
}
