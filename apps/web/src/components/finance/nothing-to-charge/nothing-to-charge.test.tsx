import { NothingToCharge } from '@web/components/finance/nothing-to-charge/nothing-to-charge'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'

describe('NothingToCharge', () => {
  it('says why there is nothing to charge and offers to include the next installment', async () => {
    const onIncludeNext = vi.fn()
    const screen = await render(
      <NothingToCharge
        chargedOn="2026-10-20"
        next={{ dueOn: '2026-11-10', amountCents: 16000 }}
        onIncludeNext={onIncludeNext}
      />,
    )

    const status = screen.getByRole('status')
    await expect.element(status.getByText('Nada a cobrar até essa data.')).toBeVisible()
    await expect
      .element(
        status.getByText(
          'O que venceu já está na cobrança de 20/10. A próxima parcela vence em 10/11.',
        ),
      )
      .toBeVisible()
    expect(status.element().querySelector('[data-slot=category-art] img')).not.toBeNull()
    await screen.getByRole('button', { name: 'Incluir até 10/11 · R$ 160,00' }).click()
    expect(onIncludeNext).toHaveBeenCalledOnce()
    await expectNoAccessibilityViolations(screen.container)
  })

  it('has no shortcut when nothing comes later', async () => {
    const screen = await render(<NothingToCharge chargedOn="2026-10-20" />)

    await expect
      .element(screen.getByText('O que venceu já está na cobrança de 20/10.'))
      .toBeVisible()
    await expect.element(screen.getByRole('button')).not.toBeInTheDocument()
  })

  it('says nothing is due when no charge holds it', async () => {
    const screen = await render(
      <NothingToCharge next={{ dueOn: '2026-11-10', amountCents: 16000 }} />,
    )

    await expect
      .element(
        screen.getByText('Nenhum item vence até essa data. A próxima parcela vence em 10/11.'),
      )
      .toBeVisible()
    await expect.element(screen.getByRole('button')).not.toBeInTheDocument()
  })
})
