import {
  type ChargeText,
  chargeClosingFor,
  chargeMessage,
  chargeSubject,
  DEFAULT_CHARGE_CLOSINGS,
  fillChargeTags,
  pixCopiaECola,
} from '@financas/shared'
import { settingsMessages } from '@web/features/settings/settings.messages'
import type {
  ChargeTextFormInput,
  ChargeTextPreviews,
  ChargeTextSample,
  SavedChargeText,
  WorkspaceSettings,
} from '@web/features/settings/settings.types'
import { formatShortDate } from '@web/lib/format/calendar'

const messages = settingsMessages.chargeText
const sample = messages.sample
const SINGLE_INSTALLMENT = 1

export function chargeTextFormValuesOf(saved: SavedChargeText): ChargeTextFormInput {
  return {
    subject: saved.subject,
    opening: saved.opening,
    closing: saved.closing ?? DEFAULT_CHARGE_CLOSINGS.email,
  }
}

export function chargeTextRequestOf(values: ChargeTextFormInput): ChargeText {
  const closing = values.closing.trim()
  return {
    subject: values.subject.trim(),
    opening: values.opening.trim(),
    closing: closing === DEFAULT_CHARGE_CLOSINGS.email ? null : closing,
  }
}

export function chargeTextPreviewsOf(
  values: ChargeTextFormInput,
  { requesterName, requesterEmail, workspaceName, today, pix }: ChargeTextSample,
): ChargeTextPreviews {
  const text = chargeTextRequestOf(values)
  const totalCents = sample.items.reduce((sum, item) => sum + item.amountCents, 0)
  const contactName = sample.contactName
  const source = { contactName, requesterName, workspaceName, totalCents, dueOn: today }
  const pixPayload = pixPayloadOf(pix, totalCents)
  const sender = messages.sender(workspaceName)
  const subject = chargeSubject(text.subject, source)
  const opening = fillChargeTags(text.opening, source)
  return {
    sender,
    subject,
    preheader: `${messages.greeting(contactName)} ${opening}`,
    pixPayload,
    whatsApp: chargeMessage({
      ...source,
      items: sample.items.map((item) => ({
        postingId: item.key,
        description: item.description,
        installmentNo: null,
        installmentCount: SINGLE_INSTALLMENT,
        effectiveOn: today,
        amountCents: item.amountCents,
        remainingCents: item.amountCents,
      })),
      pixPayload,
      text,
    }),
    email: {
      subject,
      sender,
      replyTo: requesterEmail,
      contactName,
      requesterName,
      workspaceName,
      opening,
      closing: fillChargeTags(chargeClosingFor(text.closing, 'email'), source),
      items: sample.items.map((item) => ({
        ...item,
        detail: sample.dueLabel(false, formatShortDate(today)),
      })),
      totalCents,
      dueOn: today,
      isOverdue: false,
      pix:
        pixPayload && pix.pixReceiverName && pix.pixReceiverCity
          ? {
              payload: pixPayload,
              receiverName: pix.pixReceiverName,
              receiverCity: pix.pixReceiverCity,
            }
          : null,
    },
  }
}

function pixPayloadOf(pix: WorkspaceSettings, amountCents: number): string | null {
  if (!pix.pixReceivingKey || !pix.pixReceiverName || !pix.pixReceiverCity) {
    return null
  }
  return pixCopiaECola({
    key: pix.pixReceivingKey,
    receiverName: pix.pixReceiverName,
    receiverCity: pix.pixReceiverCity,
    amountCents,
    txid: sample.txid,
  })
}
