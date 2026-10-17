import type { contactHeaderMessages } from '@web/components/finance/contact-header/contact-header.messages'

export type ContactHeaderTone = keyof typeof contactHeaderMessages.label

export type ContactHeaderProps = {
  name: string
  owedCents: number
  hasUpcoming?: boolean
  isOptedOut?: boolean
}
