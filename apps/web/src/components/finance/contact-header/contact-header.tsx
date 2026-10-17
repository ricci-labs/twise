import { Amount } from '@web/components/display/amount'
import { Avatar } from '@web/components/display/avatar'
import { contactHeaderMessages as messages } from '@web/components/finance/contact-header/contact-header.messages'
import type {
  ContactHeaderProps,
  ContactHeaderTone,
} from '@web/components/finance/contact-header/contact-header.types'
import {
  contactHeaderAmountVariants,
  contactHeaderLabelVariants,
  contactHeaderNameVariants,
  contactHeaderOptOutVariants,
  contactHeaderSentenceVariants,
  contactHeaderTopVariants,
  contactHeaderTypeVariants,
  contactHeaderVariants,
} from '@web/components/finance/contact-header/contact-header.variants'
import { MessageCircleOff } from 'lucide-react'

export function ContactHeader({
  name,
  owedCents,
  hasUpcoming = false,
  isOptedOut = false,
}: ContactHeaderProps) {
  const tone = toneOf(owedCents)
  return (
    <section data-slot="contact-header" className={contactHeaderVariants()}>
      <div className={contactHeaderTopVariants()}>
        <Avatar name={name} tone="paper" size="2xl" />
        <div className="min-w-0">
          <span className={contactHeaderTypeVariants()}>{messages.type}</span>
          <h2 className={contactHeaderNameVariants()}>{name}</h2>
        </div>
      </div>
      <span className={contactHeaderLabelVariants()}>{messages.label[tone]}</span>
      <Amount
        cents={Math.abs(owedCents)}
        size="inherit"
        className={contactHeaderAmountVariants({ tone })}
      />
      <p className={contactHeaderSentenceVariants()}>{sentenceOf(tone, hasUpcoming)}</p>
      {isOptedOut && (
        <p className={contactHeaderOptOutVariants()}>
          <MessageCircleOff aria-hidden="true" />
          {messages.optedOut}
        </p>
      )}
    </section>
  )
}

function toneOf(owedCents: number): ContactHeaderTone {
  if (owedCents < 0) {
    return 'credit'
  }
  return owedCents === 0 ? 'settled' : 'owes'
}

function sentenceOf(tone: ContactHeaderTone, hasUpcoming: boolean): string {
  if (tone === 'owes' && hasUpcoming) {
    return messages.sentence.owesWithUpcoming
  }
  return messages.sentence[tone]
}
