import type { ReactElement, ReactNode } from 'react'

export type AccountRowLinkProps = {
  className?: string
  children?: ReactNode
}

export type AccountRowProps = {
  name: string
  icon: string | null
  color: string | null
  detail: string
  amountCents?: number | null
  isArchived?: boolean
  isHighlighted?: boolean
  link?: ReactElement<AccountRowLinkProps>
  actions?: ReactNode
}
