import { type BenefitBalance, formatBrl } from '@financas/shared'
import { Link } from '@tanstack/react-router'
import { TextLink } from '@web/components/actions/text-link'
import { Amount } from '@web/components/display/amount'
import { Card } from '@web/components/display/card'
import { RichText } from '@web/components/display/rich-text'
import { homeMessages } from '@web/features/home/home.messages'
import type { BenefitCardProps, BenefitPace } from '@web/features/home/home.types'
import { cn } from '@web/lib/cn'
import { formatShortDate } from '@web/lib/format/calendar'
import { CalendarDays } from 'lucide-react'

const messages = homeMessages.benefit
const TONE_CLASS: Readonly<Record<BenefitPace['tone'], string>> = {
  good: 'text-mint-ink',
  warning: 'text-warning',
  muted: 'text-ink-muted',
}

export function BenefitCards({ workspaceId, overview, nameOf, className }: BenefitCardProps) {
  return overview.metrics.benefitBalances.map((benefit) => {
    const pace = paceOf(benefit)
    return (
      <Card
        key={benefit.accountId}
        className={className}
        title={nameOf(benefit.accountId)}
        description={messages.description}
        footerAction={
          <TextLink
            render={
              <Link
                to="/w/$workspaceId/entries"
                params={{ workspaceId }}
                search={{ accountId: benefit.accountId }}
              />
            }
          >
            {messages.seeEntries}
          </TextLink>
        }
      >
        <p className="flex items-baseline gap-2">
          <Amount cents={benefit.balanceCents} size="kpi" />
          <span className="text-body-sm text-ink-muted">{messages.left}</span>
        </p>
        <p className={cn('mt-1 text-body-sm', TONE_CLASS[pace.tone])}>{pace.text}</p>
        <p className="mt-3.5 flex items-center gap-2 rounded-md bg-sunken px-3 py-2.5 text-body-sm text-ink-muted">
          <CalendarDays className="size-4 shrink-0" aria-hidden="true" />
          <span className="[&_strong]:text-ink">
            {benefit.nextCredit ? (
              <RichText
                text={messages.nextCredit}
                values={{
                  amount: formatBrl(benefit.nextCredit.amountCents),
                  day: formatShortDate(benefit.nextCredit.dueOn),
                }}
              />
            ) : (
              messages.noCredit
            )}
          </span>
        </p>
      </Card>
    )
  })
}

function paceOf(benefit: BenefitBalance): BenefitPace {
  if (benefit.balanceCents <= 0) {
    return { text: messages.empty, tone: 'warning' }
  }
  if (!benefit.lastsUntil) {
    return { text: messages.noSpending(formatShortDate(benefit.spentSince)), tone: 'muted' }
  }
  const pace = formatBrl(benefit.dailySpendCents)
  if (benefit.nextCredit && benefit.lastsUntil >= benefit.nextCredit.dueOn) {
    return { text: messages.lastsToCredit(pace), tone: 'good' }
  }
  return {
    text: messages.lastsUntil(pace, formatShortDate(benefit.lastsUntil)),
    tone: benefit.nextCredit ? 'warning' : 'muted',
  }
}
