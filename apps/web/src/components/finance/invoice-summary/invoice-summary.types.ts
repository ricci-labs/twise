import type { BadgeProps } from '@web/components/display/badge'
import type { TwiseIconName } from '@web/components/icons/twise-icon'
import type { ReactNode } from 'react'

export type InvoiceSummaryNote = {
  icon: TwiseIconName
  tone: 'muted' | 'success'
  text: string
}

export type InvoiceSummaryProps = {
  title: string
  status: { label: string; tone: BadgeProps['tone'] }
  dates: string
  totalCents: number
  paid: { label: string; cents: number }
  due: { label: string; cents: number }
  own: { label: string; cents: number }
  fronted: { label: string; cents: number }
  splitLabel: string
  note?: InvoiceSummaryNote
  action?: ReactNode
}
