import type {
  ChargeMark,
  ContactChargeState,
  ContactChargeStateOptions,
  ContactOpenItems,
  MarkedOpenItem,
  MarkedOpenItemsOptions,
  UpcomingItem,
} from '@shared/contacts/charges/charge-state.types'
import { remainingItems } from '@shared/contacts/charges/charges'
import { OPEN_CHARGE_STATUSES } from '@shared/contacts/charges/charges.constants'
import type { ChargeableItem, OpenItem } from '@shared/contacts/charges/charges.types'
import type { IsoDate } from '@shared/core/calendar/calendar.types'

export function markedOpenItems(
  items: readonly ChargeableItem[],
  paidCents: number,
  { until, marks, includeCharged }: MarkedOpenItemsOptions,
): MarkedOpenItem[] {
  return remainingItems(items, paidCents)
    .filter((item) => item.effectiveOn <= until)
    .filter((item) => includeCharged || !marks.has(item.postingId))
    .map((item) => markedWith(item, marks.get(item.postingId)))
}

export function contactChargeState(
  items: readonly ChargeableItem[],
  paidCents: number,
  { today, marks, chargesNewestFirst }: ContactChargeStateOptions,
): ContactChargeState {
  const notCharged = remainingItems(items, paidCents).filter((item) => !marks.has(item.postingId))
  return {
    dueNotChargedCents: notCharged
      .filter((item) => item.effectiveOn <= today)
      .reduce((total, item) => total + item.remainingCents, 0),
    nextOpenDueOn: notCharged.find((item) => item.effectiveOn > today)?.effectiveOn ?? null,
    lastCharge:
      chargesNewestFirst.find((charge) => OPEN_CHARGE_STATUSES.includes(charge.status)) ?? null,
  }
}

export function upcomingItems(
  contacts: readonly ContactOpenItems[],
  { today, limit }: { today: IsoDate; limit: number },
): UpcomingItem[] {
  return contacts
    .flatMap((contact) =>
      remainingItems(contact.items, contact.paidCents)
        .filter((item) => item.effectiveOn > today)
        .map((item) => upcomingOf(contact, item)),
    )
    .sort(
      (left, right) =>
        left.dueOn.localeCompare(right.dueOn) ||
        left.contactName.localeCompare(right.contactName) ||
        left.postingId.localeCompare(right.postingId),
    )
    .slice(0, limit)
}

function markedWith(item: OpenItem, mark: ChargeMark | undefined): MarkedOpenItem {
  return { ...item, inChargeId: mark?.chargeId ?? null, inChargeCreatedOn: mark?.createdOn ?? null }
}

function upcomingOf(contact: ContactOpenItems, item: OpenItem): UpcomingItem {
  return {
    contactId: contact.contactId,
    contactName: contact.contactName,
    postingId: item.postingId,
    description: item.description,
    installmentNo: item.installmentNo,
    installmentCount: item.installmentCount,
    dueOn: item.effectiveOn,
    remainingCents: item.remainingCents,
  }
}
