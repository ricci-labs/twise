import {
  type ChargeTagSource,
  type ChargeText,
  chargeClosingFor,
  chargeMessage,
  chargeOpeningFor,
  chargeSubject,
  fillChargeTags,
  type IsoDate,
  pixCopiaECola,
} from '@financas/shared'
import type { ChargeEmailPreviewProps } from '@web/components/finance/charge-email-preview'
import { contactsMessages } from '@web/features/contacts/contacts.messages'
import type {
  ChargeEmailPreviewInput,
  ChargeMessagePreview,
  ChargeMessagePreviewInput,
  ContactCharge,
} from '@web/features/contacts/contacts.types'
import { formatShortDate } from '@web/lib/format/calendar'

const messages = contactsMessages.newCharge
const PREVIEW_TXID = 'PREVIA'

export function chargeEmailPreviewOf({
  charge,
  contactName,
  sender,
  text,
  receiver,
  today,
}: ChargeEmailPreviewInput): ChargeEmailPreviewProps {
  const dueOn = charge.dueOn as IsoDate | null
  const source = {
    contactName,
    requesterName: sender.name,
    workspaceName: sender.workspaceName,
    totalCents: charge.amountCents,
    dueOn,
  }
  return {
    subject: chargeSubject(text.subject, source),
    sender: messages.emailSender(sender.workspaceName),
    replyTo: sender.email,
    contactName,
    requesterName: sender.name,
    workspaceName: sender.workspaceName,
    opening: fillChargeTags(chargeOpeningFor(text.opening, charge.pixPayload !== null), source),
    closing: closingOf(text, source),
    items: charge.items.map((item) => ({
      key: item.postingId,
      description: itemLabelOf(item),
      detail: messages.emailItemDue(item.effectiveOn < today, formatShortDate(item.effectiveOn)),
      amountCents: item.amountCents,
    })),
    totalCents: charge.amountCents,
    dueOn,
    isOverdue: dueOn !== null && dueOn < today,
    pix:
      charge.pixPayload && receiver.name && receiver.city
        ? { payload: charge.pixPayload, receiverName: receiver.name, receiverCity: receiver.city }
        : null,
  }
}

function closingOf(text: ChargeText, source: ChargeTagSource): string {
  return fillChargeTags(chargeClosingFor(text.closing, 'email'), source)
}

function itemLabelOf(item: ContactCharge['items'][number]): string {
  return item.installmentNo === null
    ? item.description
    : messages.emailItem(item.description, item.installmentNo, item.installmentCount)
}

export function chargeMessagePreviewOf({
  openItems,
  until,
  contactName,
  sender,
  text,
  receiver,
}: ChargeMessagePreviewInput): ChargeMessagePreview {
  const items = openItems.filter((item) => item.inChargeId === null && item.effectiveOn <= until)
  const totalCents = items.reduce((sum, item) => sum + item.remainingCents, 0)
  const dueOn = (items
    .map((item) => item.effectiveOn)
    .sort()
    .at(-1) ?? null) as IsoDate | null
  const pixPayload =
    receiver.key && receiver.name && receiver.city
      ? pixCopiaECola({
          key: receiver.key,
          receiverName: receiver.name,
          receiverCity: receiver.city,
          amountCents: totalCents,
          txid: PREVIEW_TXID,
        })
      : null
  const message = chargeMessage({
    contactName,
    requesterName: sender.name,
    workspaceName: sender.workspaceName,
    totalCents,
    dueOn,
    items: items.map((item) => ({ ...item, effectiveOn: item.effectiveOn as IsoDate })),
    pixPayload,
    text,
  })
  return { message, pixPayload }
}
