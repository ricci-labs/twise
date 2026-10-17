import type { EmailParagraph } from '@api/core/email/email.types'
import { renderEmail } from '@api/core/email/layout'
import { pageLink } from '@api/core/email/links'
import type { ChargeEmail, ChargeEmailInput } from '@api/modules/contacts/contacts.types'
import {
  chargeClosingFor,
  chargeSubject,
  fillChargeTags,
  formatBrl,
  type IsoDate,
  toBrazilianDate,
} from '@financas/shared'
import encodeQR from 'qr'

export const OPT_OUT_PAGE = '/opt-out'

const QR_CID = 'pix-qr'
const QR_SCALE = 6
const QR_BORDER = 2
const SHORT_DATE_LENGTH = 5
const BRAND = 'Twise'
const FROM_SEPARATOR = ' · '

export function chargeEmail(input: ChargeEmailInput): ChargeEmail {
  const source = {
    contactName: input.contactName,
    requesterName: input.requesterName,
    workspaceName: input.workspaceName,
    totalCents: input.totalCents,
    dueOn: input.dueOn,
  }
  const greeting = `Oi, ${input.contactName}!`
  const opening = fillChargeTags(input.text.opening, source)
  const closing = fillChargeTags(chargeClosingFor(input.text.closing, 'email'), source)
  const pix = input.pix
  const rendered = renderEmail({
    baseUrl: input.publicUrl,
    preheader: `${greeting} ${opening}`,
    greeting,
    illustration: 'together',
    heading: `${formatBrl(input.totalCents)} para ${input.requesterName}`,
    paragraphs: [opening],
    blocks: [
      {
        kind: 'items',
        rows: input.items.map((item) => ({
          label: itemLabel(item),
          detail: `${item.effectiveOn < input.today ? 'venceu' : 'vence'} ${shortDate(item.effectiveOn)}`,
          amount: formatBrl(item.amountCents),
        })),
        total: { label: 'Total', amount: formatBrl(input.totalCents) },
      },
      ...(input.dueOn
        ? [
            {
              kind: 'due' as const,
              text: `${input.dueOn < input.today ? 'Venceu' : 'Vence'} em ${toBrazilianDate(input.dueOn)}`,
              isPast: input.dueOn < input.today,
            },
          ]
        : []),
      ...(pix
        ? [
            {
              kind: 'pix' as const,
              qrCid: QR_CID,
              title: 'Pague com Pix',
              text: [
                'No app do banco, escolha Pix › ',
                { strong: 'Pix copia e cola' },
                ' e cole o código. Ou leia o QR code com o celular.',
              ],
            },
            {
              kind: 'code' as const,
              label: 'Código Pix copia e cola (toque e segure para copiar):',
              code: pix.payload,
            },
          ]
        : []),
    ],
    closing: closing || undefined,
    notes: [
      ...(pix ? [receiverNote(pix.receiverName, pix.receiverCity)] : []),
      `Já pagou? Pode ignorar este e-mail; ${input.requesterName} registra o pagamento no app.`,
    ],
    reason: `Você recebeu este e-mail porque ${input.requesterName}, do espaço ${input.workspaceName}, dividiu contas com você.`,
    footerLink: {
      label: 'Não quero mais receber cobranças por e-mail',
      url: pageLink(input.publicUrl, OPT_OUT_PAGE, input.optOutToken),
    },
  })
  return {
    to: input.to,
    subject: chargeSubject(input.text.subject, source),
    fromName: `${BRAND}${FROM_SEPARATOR}${input.workspaceName}`,
    replyTo: input.replyTo,
    ...rendered,
    inlineImages: pix ? [qrImage(pix.payload)] : [],
  }
}

function itemLabel(item: ChargeEmailInput['items'][number]): string {
  return item.installmentNo === null
    ? item.description
    : `${item.description} (parcela ${item.installmentNo}/${item.installmentCount})`
}

function receiverNote(name: string, city: string): EmailParagraph {
  return [
    'Quem recebe: ',
    { strong: `${name} · ${city}` },
    '. Confira o nome no app do banco antes de pagar.',
  ]
}

function shortDate(date: IsoDate): string {
  return toBrazilianDate(date).slice(0, SHORT_DATE_LENGTH)
}

function qrImage(payload: string) {
  const gif = encodeQR(payload, 'gif', { scale: QR_SCALE, border: QR_BORDER })
  return {
    cid: QR_CID,
    filename: 'pix-qr.gif',
    contentType: 'image/gif',
    base64: Buffer.from(gif).toString('base64'),
  }
}
