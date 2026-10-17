import { ChargeEmailPreview } from '@web/components/finance/charge-email-preview/charge-email-preview'
import type { ChargeEmailPreviewProps } from '@web/components/finance/charge-email-preview/charge-email-preview.types'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'

const PIX = `00020126580014br.gov.bcb.pix0136a1b2${'0'.repeat(80)}6304E1F2`

const EMAIL: ChargeEmailPreviewProps = {
  subject: 'Member A te enviou uma cobrança de R$ 200,00',
  sender: 'Twise · Casa',
  replyTo: 'member.a@exemplo.com',
  contactName: 'Member D',
  requesterName: 'Member A',
  workspaceName: 'Casa',
  opening: 'Member A pediu para te lembrar do que está em aberto.',
  closing: 'Valeu, Member D!',
  items: [
    { key: 'a', description: 'Mercado da semana', detail: 'Cartão X', amountCents: 12_000 },
    { key: 'b', description: 'Jantar de aniversário', amountCents: 8_000 },
  ],
  totalCents: 20_000,
  dueOn: '2026-10-10',
  isOverdue: true,
  pix: { payload: PIX, receiverName: 'MEMBER A', receiverCity: 'SAO PAULO' },
}

describe('ChargeEmailPreview', () => {
  it('shows the whole e-mail: the fixed parts around the workspace opening and closing', async () => {
    const screen = await render(<ChargeEmailPreview {...EMAIL} />)
    const email = screen.getByRole('article', { name: 'O e-mail como ele chega' })

    await expect.element(email).toBeVisible()
    await expect
      .element(screen.getByText('Twise · Casa · responder para member.a@exemplo.com'))
      .toBeVisible()
    await expect.element(screen.getByText('Oi, Member D!')).toBeVisible()
    await expect.element(screen.getByText('R$ 200,00 para Member A')).toBeVisible()
    await expect.element(screen.getByText(EMAIL.opening)).toBeVisible()
    await expect
      .element(screen.getByRole('row', { name: 'Mercado da semana Cartão X R$ 120,00' }))
      .toBeVisible()
    await expect.element(screen.getByRole('row', { name: 'Total R$ 200,00' })).toBeVisible()
    await expect.element(screen.getByText('Venceu em 10/10/2026')).toBeVisible()
    await expect.element(screen.getByText(PIX)).toBeVisible()
    await expect.element(screen.getByText('Valeu, Member D!')).toBeVisible()
    await expect.element(email).toMatchTextContent('Quem recebe: MEMBER A · SAO PAULO.')
    await expect
      .element(screen.getByText('Não quero mais receber cobranças por e-mail'))
      .toBeVisible()
    await expectNoAccessibilityViolations(screen.container)
  })

  it('leaves out the Pix, the receiver note and the closing when the charge has none', async () => {
    const screen = await render(
      <ChargeEmailPreview {...EMAIL} pix={null} closing="" dueOn="2026-11-10" isOverdue={false} />,
    )
    const email = screen.getByRole('article', { name: 'O e-mail como ele chega' })

    await expect.element(screen.getByText('Vence em 10/11/2026')).toBeVisible()
    await expect.element(email).not.toMatchTextContent('Pague com Pix')
    await expect.element(email).not.toMatchTextContent('Quem recebe')
    await expect.element(email).not.toMatchTextContent('Valeu')
  })
})
