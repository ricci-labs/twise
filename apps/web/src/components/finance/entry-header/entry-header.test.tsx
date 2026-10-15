import { EntryHeader } from '@web/components/finance/entry-header/entry-header'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'

describe('EntryHeader', () => {
  it('names the entry under its type, with the amount and the detail line', async () => {
    const screen = await render(
      <EntryHeader
        art={{ name: 'Lazer', icon: 'leisure' }}
        typeLabel="Compra no cartão"
        description="Tênis de corrida"
        amountCents={100000}
        direction="out"
        detail="3× de R$ 333,34 · ter, 20 out 2026"
      />,
    )

    await expect.element(screen.getByRole('heading', { name: 'Tênis de corrida' })).toBeVisible()
    await expect.element(screen.getByText('Compra no cartão')).toBeVisible()
    await expect
      .poll(() =>
        screen.container.querySelector('[data-slot=amount]')?.textContent?.replace(/\s/g, ' '),
      )
      .toBe('R$ 1.000,00')
    await expectNoAccessibilityViolations(screen.container)
  })

  it('shows money in with "+"', async () => {
    const screen = await render(
      <EntryHeader
        art={{ name: 'Salário', icon: 'coin' }}
        typeLabel="Receita"
        description="Salário"
        amountCents={620000}
        direction="in"
        detail="seg, 5 out 2026"
      />,
    )
    await expect
      .poll(() =>
        screen.container.querySelector('[data-slot=amount]')?.textContent?.replace(/\s/g, ' '),
      )
      .toBe('+R$ 6.200,00')
  })
})
