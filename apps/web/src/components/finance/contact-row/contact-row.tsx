import { formatBrl } from '@financas/shared'
import { Button } from '@web/components/actions/button'
import { Amount } from '@web/components/display/amount'
import { Avatar } from '@web/components/display/avatar'
import { Badge } from '@web/components/display/badge'
import { contactRowMessages as messages } from '@web/components/finance/contact-row/contact-row.messages'
import type {
  ContactBalanceTone,
  ContactChannel,
  ContactChannelsProps,
  ContactOwedProps,
  ContactRowProps,
  ContactStateFacts,
  ContactStateProps,
} from '@web/components/finance/contact-row/contact-row.types'
import {
  contactRowAmountVariants,
  contactRowAvatarVariants,
  contactRowBalanceLabelVariants,
  contactRowBalanceVariants,
  contactRowChannelsVariants,
  contactRowChannelVariants,
  contactRowChargeVariants,
  contactRowEndVariants,
  contactRowMainVariants,
  contactRowNameVariants,
  contactRowStateVariants,
  contactRowTextVariants,
  contactRowVariants,
} from '@web/components/finance/contact-row/contact-row.variants'
import { formatShortDate } from '@web/lib/format/calendar'
import { Mail, MessageCircle } from 'lucide-react'
import { cloneElement, useId } from 'react'

const CHANNEL_ICONS = {
  whatsapp: MessageCircle,
  email: Mail,
} as const satisfies Record<ContactChannel, unknown>

export function ContactRow({
  name,
  owedCents,
  overdueCents = 0,
  overdueSince = null,
  nextDueOn = null,
  nextDueCents = 0,
  chargedOn = null,
  isOptedOut = false,
  channels,
  isArchived = false,
  link,
  onCharge,
}: ContactRowProps) {
  const balanceId = useId()
  const tone = balanceToneOf(owedCents, overdueCents)
  const content = (
    <>
      <Avatar
        name={name}
        tone="paper"
        size="xl"
        className={contactRowAvatarVariants({ isArchived })}
      />
      <span className={contactRowTextVariants()}>
        <span className={contactRowNameVariants({ isArchived })}>{name}</span>
        <ContactState
          owedCents={owedCents}
          overdueCents={overdueCents}
          overdueSince={overdueSince}
          nextDueOn={nextDueOn}
          nextDueCents={nextDueCents}
          chargedOn={chargedOn}
          isOptedOut={isOptedOut}
          className={contactRowStateVariants()}
        />
        {channels.length > 0 && (
          <ContactChannels channels={channels} className={contactRowChannelsVariants()} />
        )}
      </span>
    </>
  )
  const className = contactRowMainVariants()
  return (
    <li data-slot="contact-row" className={contactRowVariants()}>
      {link ? (
        cloneElement(link, { className, 'aria-describedby': balanceId }, content)
      ) : (
        <div className={className}>{content}</div>
      )}
      <span className={contactRowEndVariants()}>
        <span id={balanceId} className={contactRowBalanceVariants()}>
          <ContactOwed owedCents={owedCents} overdueCents={overdueCents} />
          <span className={contactRowBalanceLabelVariants()}>{messages.balance[tone]}</span>
        </span>
        {onCharge && (
          <Button
            size="xs"
            className={contactRowChargeVariants()}
            aria-label={messages.chargeLabel(name)}
            onClick={onCharge}
          >
            {messages.charge}
          </Button>
        )}
      </span>
    </li>
  )
}

export function ContactState({
  chargedOn = null,
  isOptedOut = false,
  className,
  ...facts
}: ContactStateProps) {
  const isOverdue = facts.overdueCents > 0
  return (
    <span data-slot="contact-state" className={className}>
      {isOverdue && chargedOn && (
        <Badge tone="warning" size="compact" hasDot>
          {messages.badges.charged(formatShortDate(chargedOn))}
        </Badge>
      )}
      {isOverdue && !chargedOn && (
        <Badge tone="danger" size="compact" hasDot>
          {messages.badges.overdue}
        </Badge>
      )}
      {isOptedOut && (
        <Badge tone="neutral" size="compact" hasDot>
          {messages.badges.optedOut}
        </Badge>
      )}
      {stateOf(facts)}
    </span>
  )
}

export function ContactChannels({ channels, className }: ContactChannelsProps) {
  return (
    <span data-slot="contact-channels" className={className}>
      {channels.map((channel) => {
        const Icon = CHANNEL_ICONS[channel]
        return (
          <span key={channel} className={contactRowChannelVariants()}>
            <Icon aria-hidden="true" />
            {messages.channels[channel]}
          </span>
        )
      })}
    </span>
  )
}

export function ContactOwed({ owedCents, overdueCents = 0 }: ContactOwedProps) {
  return (
    <Amount
      cents={Math.abs(owedCents)}
      size="inherit"
      className={contactRowAmountVariants({ tone: balanceToneOf(owedCents, overdueCents) })}
    />
  )
}

function balanceToneOf(owedCents: number, overdueCents: number): ContactBalanceTone {
  if (owedCents < 0) {
    return 'credit'
  }
  if (owedCents === 0) {
    return 'settled'
  }
  return overdueCents > 0 ? 'late' : 'owes'
}

function stateOf({
  owedCents,
  overdueCents,
  overdueSince,
  nextDueOn,
  nextDueCents,
}: ContactStateFacts): string {
  if (overdueCents > 0) {
    const amount = formatBrl(overdueCents)
    return overdueSince
      ? messages.state.overdueSince(amount, formatShortDate(overdueSince))
      : messages.state.overdue(amount)
  }
  if (nextDueOn && nextDueCents > 0) {
    return messages.state.next(formatBrl(nextDueCents), formatShortDate(nextDueOn))
  }
  if (owedCents < 0) {
    return messages.state.credit(formatBrl(-owedCents))
  }
  return messages.state.settled
}
