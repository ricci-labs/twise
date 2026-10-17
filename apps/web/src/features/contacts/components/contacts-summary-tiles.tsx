import { PlanSummaryTiles } from '@web/components/finance/plan-summary-tiles'
import { contactsSummaryOf } from '@web/features/contacts/components/listed-contacts'
import { contactsMessages } from '@web/features/contacts/contacts.messages'
import type {
  ContactsSummary,
  ContactsSummaryTilesProps,
} from '@web/features/contacts/contacts.types'
import { formatShortDate } from '@web/lib/format/calendar'

const messages = contactsMessages.summary

export function ContactsSummaryTiles({ contacts }: ContactsSummaryTilesProps) {
  const summary = contactsSummaryOf(contacts)
  return (
    <PlanSummaryTiles
      label={messages.label}
      tiles={[
        {
          label: messages.owed,
          amountCents: summary.owedCents,
          tone: summary.owedCents > 0 ? 'income' : 'neutral',
          note: summary.owingCount > 0 ? messages.owedFrom(summary.owingCount) : undefined,
        },
        {
          label: messages.overdue,
          amountCents: summary.overdueCents,
          tone: summary.overdueCents > 0 ? 'danger' : 'neutral',
          note: overdueNote(summary),
        },
      ]}
    />
  )
}

function overdueNote({ overdueCount, overdueSince }: ContactsSummary): string | undefined {
  if (overdueCount === 0) {
    return undefined
  }
  return overdueSince
    ? messages.overdueSince(overdueCount, formatShortDate(overdueSince))
    : messages.overdueCount(overdueCount)
}
