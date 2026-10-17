import { DEFAULT_CHARGE_TEXT } from '@shared/contacts/charge-text/charge-text.constants'
import { chargeMessage, chargeStatusOf, openItems } from '@shared/contacts/charges/charges'
import type { ChargeableItem } from '@shared/contacts/charges/charges.types'
import { formatBrl } from '@shared/core/money/money'
import { describe, expect, it } from 'vitest'

function item(
  postingId: string,
  effectiveOn: string,
  amountCents: number,
  installmentNo: number | null = null,
): ChargeableItem {
  return {
    postingId,
    description: 'TV',
    installmentNo,
    installmentCount: installmentNo ? 3 : 1,
    effectiveOn,
    amountCents,
  }
}

const TV = [
  item('p1', '2026-10-10', 10_000, 1),
  item('p2', '2026-11-10', 10_000, 2),
  item('p3', '2026-12-10', 10_000, 3),
]

const TV_MESSAGE = {
  contactName: 'Contact J',
  requesterName: 'Member A',
  workspaceName: 'Casa',
  items: openItems(TV, 0, { until: '2026-10-31', alreadyCharged: new Set() }),
  totalCents: 10_000,
  dueOn: '2026-10-10',
  pixPayload: null,
}

describe('openItems', () => {
  it('pays the oldest items first and keeps what is still open up to the date', () => {
    const open = openItems(TV, 14_000, { until: '2026-11-30', alreadyCharged: new Set() })
    expect(open.map((open) => [open.postingId, open.remainingCents])).toEqual([['p2', 6_000]])
  })

  it('leaves out items already in an open charge', () => {
    const open = openItems(TV, 0, { until: '2026-12-31', alreadyCharged: new Set(['p1']) })
    expect(open.map((open) => open.postingId)).toEqual(['p2', 'p3'])
  })

  it('orders items of the same day by posting, whatever the input order', () => {
    const sameDay = [item('b', '2026-10-10', 1_000), item('a', '2026-10-10', 1_000)]
    const open = openItems(sameDay, 1_000, { until: '2026-10-31', alreadyCharged: new Set() })
    expect(open.map((open) => open.postingId)).toEqual(['b'])
  })
})

describe('chargeMessage', () => {
  it('lists the items, the total, the due date and the Pix copia e cola in pt-BR', () => {
    const items = openItems(TV, 0, { until: '2026-11-30', alreadyCharged: new Set() })
    expect(
      chargeMessage({
        contactName: 'Contact J',
        requesterName: 'Member A',
        workspaceName: 'Casa',
        items,
        totalCents: 20_000,
        dueOn: '2026-11-10',
        pixPayload: '000201...',
        text: DEFAULT_CHARGE_TEXT,
      }),
    ).toBe(
      [
        'Oi, Contact J! Member A pediu para te lembrar do que está em aberto. Dá para pagar com Pix, o valor já vem preenchido.',
        '• TV (parcela 1/3) — R$ 100,00',
        '• TV (parcela 2/3) — R$ 100,00',
        'Total: R$ 200,00',
        'Vencimento: 10/11/2026',
        'Pix copia e cola:',
        '000201...',
      ].join('\n'),
    )
  })

  it('leaves out the installment, the due date and the Pix when there are none', () => {
    const message = chargeMessage({
      contactName: 'Contact M',
      requesterName: 'Member B',
      workspaceName: 'Casa',
      items: [
        {
          ...item('p9', '2026-10-01', 5_000),
          description: 'Jantar',
          installmentNo: 1,
          installmentCount: 1,
          remainingCents: 5_000,
        },
      ],
      totalCents: 5_000,
      dueOn: null,
      pixPayload: null,
      text: { opening: 'Oi de novo, sou {quem cobra}.', closing: '' },
    })
    expect(message).toBe(
      'Oi, Contact M! Oi de novo, sou Member B.\n• Jantar — R$ 50,00\nTotal: R$ 50,00',
    )
  })

  it('fills the tags of the workspace opening and closing and ends with the closing', () => {
    const message = chargeMessage({
      ...TV_MESSAGE,
      text: {
        opening: '{quem cobra}, do espaço {espaço}, lembra: {valor} até {vencimento}.',
        closing: 'Valeu, {contato}!',
      },
    })
    expect(message.split('\n')).toEqual([
      `Oi, Contact J! Member A, do espaço Casa, lembra: ${formatBrl(10_000)} até 10/10/2026.`,
      `• TV (parcela 1/3) — ${formatBrl(10_000)}`,
      `Total: ${formatBrl(10_000)}`,
      'Vencimento: 10/10/2026',
      'Valeu, Contact J!',
    ])
  })

  it('leaves the e-mail closing out of the WhatsApp message by default', () => {
    const message = chargeMessage({ ...TV_MESSAGE, text: DEFAULT_CHARGE_TEXT })
    expect(message).not.toContain('e-mail')
    expect(message.split('\n').at(-1)).toBe('Vencimento: 10/10/2026')
  })
})

describe('chargeStatusOf', () => {
  it('derives paid and partially paid from the payments, keeping cancelled and the lifecycle', () => {
    expect(chargeStatusOf('sent', 10_000, 0)).toBe('sent')
    expect(chargeStatusOf('sent', 10_000, 4_000)).toBe('partially_paid')
    expect(chargeStatusOf('draft', 10_000, 10_000)).toBe('paid')
    expect(chargeStatusOf('sent', 10_000, 12_000)).toBe('paid')
    expect(chargeStatusOf('cancelled', 10_000, 10_000)).toBe('cancelled')
  })
})
