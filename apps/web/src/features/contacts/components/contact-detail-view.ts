import type { IsoDate } from '@financas/shared'
import type { PlanSummaryTile } from '@web/components/finance/plan-summary-tiles'
import { contactsMessages } from '@web/features/contacts/contacts.messages'
import type {
  ContactBalance,
  ContactOpenItem,
  ContactOpenItems,
} from '@web/features/contacts/contacts.types'
import { formatShortDate } from '@web/lib/format/calendar'

const messages = contactsMessages.detail

export function openItemsByDue(
  items: readonly ContactOpenItem[],
  today: IsoDate,
): ContactOpenItems {
  return {
    overdue: items.filter((item) => item.effectiveOn <= today),
    upcoming: items.filter((item) => item.effectiveOn > today),
  }
}

export function openItemDetail(item: ContactOpenItem): string {
  return item.installmentNo === null
    ? ''
    : messages.installment(item.installmentNo, item.installmentCount)
}

export function hasSomethingToCharge(balance: ContactBalance | undefined): boolean {
  return balance !== undefined && (balance.dueNotChargedCents > 0 || balance.nextOpenDueOn !== null)
}

export function contactTilesOf(balance: ContactBalance): [PlanSummaryTile, PlanSummaryTile] {
  return [
    {
      label: messages.overdue,
      amountCents: balance.overdueCents,
      tone: balance.overdueCents > 0 ? 'danger' : 'neutral',
      note: balance.overdueSince
        ? messages.overdueSince(formatShortDate(balance.overdueSince))
        : undefined,
    },
    {
      label: messages.nextDue,
      amountCents: balance.nextDueCents,
      note: balance.nextDueOn ? messages.nextDueOn(formatShortDate(balance.nextDueOn)) : undefined,
    },
  ]
}
