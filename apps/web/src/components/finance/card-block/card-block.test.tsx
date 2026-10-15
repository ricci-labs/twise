import { CardBlock } from '@web/components/finance/card-block/card-block'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { expectClampedToTwoLines, expectWholeAmount, LONG_TEXT } from '@web/testing/long-text'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'

describe('CardBlock', () => {
  it('shows the cycle, the open invoice, the limit and the best day to buy', async () => {
    const screen = await render(
      <CardBlock
        name="Cartão X"
        icon="card"
        color={null}
        cycle="Fecha dia 25 · vence dia 4"
        link={<a href="#cartao" />}
        invoice={{
          label: 'Fatura aberta',
          amountCents: 195000,
          due: 'vence 04/11',
          link: <a href="#fatura">fatura</a>,
        }}
        limit={{ label: 'Limite de R$ 6.000,00', used: '48% usado', percent: 48 }}
        open="Em aberto no cartão: R$ 2.890,00, com as parcelas futuras"
        bestDay={{ label: 'Melhor dia de compra:', value: 'dia 25' }}
      />,
    )
    const card = screen.getByRole('article', { name: 'Cartão X' })

    await expect
      .element(card.getByRole('link', { name: /Fatura aberta/ }))
      .toHaveAttribute('href', '#fatura')
    await expect.element(card.getByText('48% usado')).toBeVisible()
    await expect.element(card.getByText('dia 25')).toBeVisible()
    await expectNoAccessibilityViolations(screen.container)
  })

  it('stays inside a narrow column, with a long name at two lines and the invoice whole', async () => {
    const screen = await render(
      <div className="grid w-80">
        <CardBlock
          name={`${LONG_TEXT.account} ${LONG_TEXT.description}`}
          icon="card"
          color={null}
          cycle={`Fecha dia 25 · vence dia 4 · ${LONG_TEXT.person} · ${LONG_TEXT.account}`}
          link={<a href="#cartao" />}
          invoice={{
            label: 'Fatura aberta',
            amountCents: LONG_TEXT.amountCents,
            due: 'vence 04/11',
            link: <a href="#fatura">fatura</a>,
          }}
          open="Em aberto no cartão"
          bestDay={{ label: 'Melhor dia de compra:', value: 'dia 25' }}
        />
      </div>,
    )
    const block = screen.container.querySelector('[data-slot=card-block]') as HTMLElement
    const invoice = screen.getByRole('link', { name: /Fatura aberta/ }).element()

    expect(block.getBoundingClientRect().width).toBeLessThanOrEqual(320)
    expectClampedToTwoLines(screen.getByText(LONG_TEXT.description, { exact: false }).element())
    expectClampedToTwoLines(screen.getByText(LONG_TEXT.person, { exact: false }).element())
    expectWholeAmount(invoice.querySelector('[data-slot=amount]') as HTMLElement, invoice)
  })
})
