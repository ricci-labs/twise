import type { IsoDate } from '@financas/shared'
import type { contactRowMessages } from '@web/components/finance/contact-row/contact-row.messages'
import type { ReactElement, ReactNode } from 'react'

export type ContactChannel = keyof typeof contactRowMessages.channels

export type ContactBalanceTone = keyof typeof contactRowMessages.balance

export type ContactRowLinkProps = {
  className?: string
  children?: ReactNode
  'aria-describedby'?: string
}

export type ContactRowProps = {
  name: string
  owedCents: number
  overdueCents?: number
  overdueSince?: IsoDate | null
  nextDueOn?: IsoDate | null
  nextDueCents?: number
  chargedOn?: IsoDate | null
  isOptedOut?: boolean
  channels: readonly ContactChannel[]
  isArchived?: boolean
  link?: ReactElement<ContactRowLinkProps>
  onCharge?: () => void
}

export type ContactStateFacts = {
  owedCents: number
  overdueCents: number
  overdueSince: IsoDate | null
  nextDueOn: IsoDate | null
  nextDueCents: number
}

export type ContactStateProps = ContactStateFacts & {
  chargedOn?: IsoDate | null
  isOptedOut?: boolean
  className?: string
}

export type ContactChannelsProps = {
  channels: readonly ContactChannel[]
  className?: string
}

export type ContactOwedProps = {
  owedCents: number
  overdueCents?: number
}
