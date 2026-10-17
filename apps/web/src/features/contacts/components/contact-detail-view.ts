import { type ChargeStatus, type IsoDate, todayIn } from '@financas/shared'
import type { PlanSummaryTile } from '@web/components/finance/plan-summary-tiles'
import { contactsMessages } from '@web/features/contacts/contacts.messages'
import type {
  ContactBalance,
  ContactCharge,
  ContactChargeView,
  ContactOpenItem,
  ContactOpenItems,
} from '@web/features/contacts/contacts.types'
import { formatShortDate } from '@web/lib/format/calendar'

const messages = contactsMessages.detail
const OPEN_STATUSES: readonly ChargeStatus[] = ['draft', 'sent', 'partially_paid']
const MARKED_SENT = 'manual'

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

export function contactChargeViewOf(
  charge: ContactCharge,
  today: IsoDate,
  timeZone: string,
): ContactChargeView {
  const isOpen = OPEN_STATUSES.includes(charge.status)
  return {
    id: charge.id,
    createdOn: todayIn(timeZone, new Date(charge.createdAt)) as IsoDate,
    amountCents: charge.amountCents,
    status: charge.status,
    itemCount: charge.items.length,
    history: charge.sentAt
      ? { kind: 'sent', send: { via: MARKED_SENT, sentAt: charge.sentAt } }
      : undefined,
    items: charge.items.map((item) => ({
      key: item.postingId,
      description: chargeItemDescription(item),
      amountCents: item.amountCents,
    })),
    dueOn: charge.dueOn as IsoDate | null,
    isDuePast: charge.dueOn !== null && charge.dueOn < today,
    isOpen,
    canCancel: isOpen && charge.paidCents === 0,
    messageText: charge.messageText,
    pixPayload: charge.pixPayload,
  }
}

function chargeItemDescription(item: ContactCharge['items'][number]): string {
  return item.installmentNo === null
    ? item.description
    : `${item.description} · ${messages.installment(item.installmentNo, item.installmentCount)}`
}
