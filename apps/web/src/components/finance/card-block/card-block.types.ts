import type { ReactElement, ReactNode } from 'react'

export type CardBlockLinkProps = {
  className?: string
  children?: ReactNode
}

export type CardBlockInvoice = {
  label: string
  amountCents: number
  due: string
  link: ReactElement<CardBlockLinkProps>
}

export type CardBlockLimit = {
  label: string
  used: string
  percent: number
}

export type CardBlockProps = {
  name: string
  icon: string | null
  color: string | null
  cycle: string
  link: ReactElement<CardBlockLinkProps>
  invoice: CardBlockInvoice
  limit?: CardBlockLimit
  open: string
  bestDay: { label: string; value: string }
  actions?: ReactNode
}
