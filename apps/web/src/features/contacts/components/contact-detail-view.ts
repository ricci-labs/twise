import { type ChargeStatus, type IsoDate, todayIn } from '@financas/shared'
import type { ChargeHistory, ChargeReceipt } from '@web/components/finance/charge-body'
import type { ChargePreviewItem } from '@web/components/finance/charge-preview'
import type { PlanSummaryTile } from '@web/components/finance/plan-summary-tiles'
import type { UntilNextDue } from '@web/components/finance/until-chips'
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
  accountNames: ReadonlyMap<string, string> = new Map(),
): ContactChargeView {
  const isOpen = OPEN_STATUSES.includes(charge.status)
  return {
    id: charge.id,
    createdOn: todayIn(timeZone, new Date(charge.createdAt)) as IsoDate,
    amountCents: charge.amountCents,
    paidCents: charge.paidCents,
    status: charge.status,
    itemCount: charge.items.length,
    history: historyOf(charge, receiptOf(charge, accountNames)),
    sentVia: charge.sentVia,
    hasEmailFailed: charge.emailStatus === 'failed',
    sentTo: charge.sentTo,
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

function historyOf(
  charge: ContactCharge,
  receipt: ChargeReceipt | undefined,
): ChargeHistory | undefined {
  if (charge.emailStatus === 'failed' && charge.sentTo) {
    return { kind: 'emailFailed', sentTo: charge.sentTo }
  }
  if (!charge.sentAt) {
    return receipt && { kind: 'received', receipt }
  }
  return {
    kind: 'sent',
    send: { via: charge.sentVia ?? MARKED_SENT, sentAt: charge.sentAt, sentTo: charge.sentTo },
    receipt,
  }
}

function receiptOf(
  charge: ContactCharge,
  accountNames: ReadonlyMap<string, string>,
): ChargeReceipt | undefined {
  const last = charge.payments.at(-1)
  if (!last) {
    return undefined
  }
  return {
    receivedCents: charge.paidCents,
    receivedOn: last.receivedOn as IsoDate,
    accountName: (last.accountId && accountNames.get(last.accountId)) || '',
    leftCents: Math.max(charge.amountCents - charge.paidCents, 0),
  }
}

function chargeItemDescription(item: ContactCharge['items'][number]): string {
  return item.installmentNo === null
    ? item.description
    : `${item.description} · ${messages.installment(item.installmentNo, item.installmentCount)}`
}

export function chargeableBy(
  items: readonly ContactOpenItem[],
  until: IsoDate,
  today: IsoDate,
): ChargePreviewItem[] {
  return items
    .filter((item) => item.inChargeId === null && item.effectiveOn <= until)
    .map((item) => ({
      key: item.postingId,
      description: chargeItemLabel(item),
      dueOn: item.effectiveOn,
      isOverdue: item.effectiveOn <= today,
      amountCents: item.remainingCents,
    }))
}

export function nextUntilOf(
  items: readonly ContactOpenItem[],
  today: IsoDate,
): UntilNextDue | null {
  const upcoming = items.filter((item) => item.inChargeId === null && item.effectiveOn > today)
  const dueOn = upcoming.map((item) => item.effectiveOn).sort()[0]
  return dueOn
    ? { dueOn, installmentCount: upcoming.filter((item) => item.effectiveOn === dueOn).length }
    : null
}

export function defaultUntilOf(balance: ContactBalance | undefined, today: IsoDate): IsoDate {
  return balance && balance.dueNotChargedCents === 0 && balance.nextOpenDueOn
    ? balance.nextOpenDueOn
    : today
}

function chargeItemLabel(item: ContactOpenItem): string {
  return item.installmentNo === null
    ? item.description
    : `${item.description} (${messages.installment(item.installmentNo, item.installmentCount).toLowerCase()})`
}
