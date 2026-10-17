import { ChargeBody } from '@web/components/finance/charge-body/charge-body'
import type {
  ChargeAction,
  ChargeBodyProps,
} from '@web/components/finance/charge-body/charge-body.types'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'

const MESSAGE = <p>Oi, Member D!</p>

function action(key: string, label: string, onPress = () => undefined): ChargeAction {
  return { key, label, icon: 'send', onPress }
}

function charge(props: Partial<ChargeBodyProps> = {}) {
  return (
    <div className="w-82">
      <ChargeBody
        items={[
          { key: 'market', description: 'Mercado da semana', amountCents: 12000 },
          { key: 'dinner', description: 'Jantar de aniversário', amountCents: 8000 },
        ]}
        totalCents={20000}
        dueOn="2026-10-10"
        isDuePast
        message={MESSAGE}
        {...props}
      />
    </div>
  )
}

function textOf(element: Element | null | undefined): string {
  return (element?.textContent ?? '').replaceAll('\u00a0', ' ')
}

describe('ChargeBody', () => {
  it('shows the send, the items with the total, the message and the actions', async () => {
    const onPay = vi.fn()
    const screen = await render(
      charge({
        history: {
          kind: 'sent',
          send: { via: 'email', sentAt: '2026-10-20T17:32:00Z', sentTo: 'member.d@exemplo.com' },
        },
        primaryAction: action('pay', 'Registrar pagamento', onPay),
        actions: [action('resend', 'Enviar de novo'), action('pix', 'Copiar Pix')],
      }),
    )

    await expect
      .element(screen.getByText('Enviada por e-mail em 20/10 às 14:32 para member.d@exemplo.com'))
      .toBeVisible()
    const rows = [...screen.container.querySelectorAll('li')].map(textOf)
    expect(rows).toEqual([
      'Mercado da semanaR$ 120,00',
      'Jantar de aniversárioR$ 80,00',
      'Total · venceu em 10/10R$ 200,00',
    ])
    const message = screen.getByText('Oi, Member D!')
    await expect.element(message).toBeVisible()
    expect(message.element().closest('details')?.querySelector('summary')?.textContent).toBe(
      'Mensagem',
    )
    const group = screen.getByRole('group', { name: 'Ações da cobrança' })
    await expect.element(group).toBeVisible()
    await screen.getByRole('button', { name: 'Registrar pagamento' }).click()
    expect(onPay).toHaveBeenCalledOnce()
    const pay = screen.getByRole('button', { name: 'Registrar pagamento' }).element()
    const resend = screen.getByRole('button', { name: 'Enviar de novo' }).element()
    expect(pay.getBoundingClientRect().width).toBeGreaterThan(resend.getBoundingClientRect().width)
    await expectNoAccessibilityViolations(screen.container)
  })

  it('tints the line and says why when the e-mail did not leave', async () => {
    const screen = await render(
      <>
        {charge({
          history: { kind: 'emailFailed', sentTo: 'member.d@exemplo.com' },
          primaryAction: action('retry', 'Tentar o e-mail de novo'),
          actions: [action('whatsapp', 'Pelo WhatsApp'), action('fix', 'Corrigir e-mail')],
        })}
        <span data-testid="danger-tint" className="bg-danger-soft" />
      </>,
    )
    const line = screen.getByText(/O e-mail não saiu/)

    await expect
      .element(line)
      .toHaveTextContent(
        'O e-mail não saiu: o endereço member.d@exemplo.com recusou. Confira o e-mail do contato ou envie pelo WhatsApp.',
      )
    const tinted = line.element().closest('p') as HTMLElement
    const dangerTint = screen.getByTestId('danger-tint').element()
    expect(getComputedStyle(tinted).backgroundColor).toBe(
      getComputedStyle(dangerTint).backgroundColor,
    )
    await expectNoAccessibilityViolations(screen.container)
  })

  it('says what was received and what is left', async () => {
    const screen = await render(
      charge({
        history: {
          kind: 'sent',
          send: { via: 'whatsapp', sentAt: '2026-10-20T17:32:00Z' },
          receipt: {
            receivedCents: 12000,
            receivedOn: '2026-10-20',
            accountName: 'Conta X',
            leftCents: 8000,
          },
        },
      }),
    )

    await expect
      .element(
        screen.getByText(
          'Enviada pelo WhatsApp em 20/10 · R$ 120,00 recebidos em 20/10 na Conta X, falta R$ 80,00',
        ),
      )
      .toBeVisible()
  })

  it('folds the message and gives a viewer two equal actions', async () => {
    const screen = await render(
      charge({
        isMessageOpen: false,
        actions: [
          { key: 'message', label: 'Copiar mensagem', onPress: () => undefined },
          { key: 'pix', label: 'Copiar Pix', onPress: () => undefined },
        ],
      }),
    )

    await expect.element(screen.getByText('Oi, Member D!')).not.toBeVisible()
    await screen.getByText('Mensagem').click()
    await expect.element(screen.getByText('Oi, Member D!')).toBeVisible()
    const message = screen.getByRole('button', { name: 'Copiar mensagem' }).element()
    const pix = screen.getByRole('button', { name: 'Copiar Pix' }).element()
    expect(message.getBoundingClientRect().width).toBe(pix.getBoundingClientRect().width)
    expect(message.getBoundingClientRect().top).toBe(pix.getBoundingClientRect().top)
    expect(message.scrollWidth).toBeLessThanOrEqual(message.clientWidth)
  })

  it('keeps long amounts whole and a long address inside the line on a phone', async () => {
    const address = 'maria.aparecida.dos.santos.oliveira@exemplo.com'
    const screen = await render(
      <div className="w-80">
        <ChargeBody
          history={{
            kind: 'sent',
            send: { via: 'email', sentAt: '2026-10-20T17:32:00Z', sentTo: address },
          }}
          items={[
            {
              key: 'reform',
              description: 'Reforma do apartamento da praia com a família toda (parcela 12/12)',
              amountCents: 125652000,
            },
          ]}
          totalCents={125652000}
          message={MESSAGE}
        />
      </div>,
    )

    for (const amount of screen.getByText('R$ 1.256.520,00').elements()) {
      expect(amount.getBoundingClientRect().height).toBeLessThan(24)
    }
    const line = screen.getByText(address).element().closest('p') as HTMLElement
    expect(line.scrollWidth).toBeLessThanOrEqual(line.clientWidth)
    expect(address).toHaveLength(47)
  })
})
