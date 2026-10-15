import { BudgetRow } from '@web/components/finance/budget-row/budget-row'
import type { BudgetRowProps } from '@web/components/finance/budget-row/budget-row.types'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'

const MARKET: BudgetRowProps = {
  name: 'Mercado',
  art: { name: 'Mercado', icon: 'groceries' },
  spentCents: 82000,
  limitCents: 120000,
  markPercent: 52,
  status: 'ahead',
  statusText: 'Acima do ritmo: 16 pontos à frente',
}

function inList(props: Partial<BudgetRowProps>) {
  return render(
    <div className="w-90">
      <ul>
        <BudgetRow {...MARKET} {...props} />
      </ul>
    </div>,
  )
}

describe('BudgetRow', () => {
  it('shows what was spent of the limit, the bar and the status in words', async () => {
    const screen = await inList({})
    await expect.element(screen.getByText('Acima do ritmo: 16 pontos à frente')).toBeVisible()
    await expect.element(screen.getByText('R$ 820,00')).toBeVisible()
    await expect.element(screen.getByText('R$ 1.200,00')).toBeVisible()
    await expectNoAccessibilityViolations(screen.container)
  })

  it('shows the largest subcategory and opens the rest from "+N"', async () => {
    const onMore = vi.fn()
    const screen = await inList({
      subcategories: [
        { label: 'Feira', amountCents: 21000 },
        { label: 'Padaria', amountCents: 9500 },
      ],
      moreHint: 'subcategorias de Mercado',
      onMore,
    })
    await expect.element(screen.getByText(/Feira/)).toBeVisible()
    await screen.getByRole('button', { name: '+1 subcategorias de Mercado' }).click()
    expect(onMore).toHaveBeenCalledOnce()
    await expectNoAccessibilityViolations(screen.container)
  })

  it('moves "R$ X de R$ Y" whole under a long name, never breaking it', async () => {
    const screen = await inList({
      name: 'Internet fibra 1 giga com TV e telefone da casa da praia',
      spentCents: 123456789,
      limitCents: 150000000,
    })
    const amounts = screen.getByText('R$ 1.234.567,89').element().parentElement?.parentElement
    expect(amounts?.getBoundingClientRect().height).toBeLessThan(26)
    const row = screen.getByRole('listitem').element()
    expect(amounts?.getBoundingClientRect().right).toBeLessThanOrEqual(
      row.getBoundingClientRect().right,
    )
  })
})
