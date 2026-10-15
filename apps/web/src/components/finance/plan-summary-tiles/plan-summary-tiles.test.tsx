import { PlanSummaryTiles } from '@web/components/finance/plan-summary-tiles/plan-summary-tiles'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'

describe('PlanSummaryTiles', () => {
  it('pairs each label with its amount and note', async () => {
    const screen = await render(
      <PlanSummaryTiles
        label="Resumo do período"
        tiles={[
          { label: 'Falta pagar', amountCents: 54990, note: '4 contas, 1 atrasada' },
          { label: 'Falta receber', amountCents: 80000, tone: 'income', note: '1 receita' },
        ]}
      />,
    )
    await expect.element(screen.getByText('R$ 549,90')).toBeVisible()
    await expect.element(screen.getByText('4 contas, 1 atrasada')).toBeVisible()
    await expect.element(screen.getByText('R$ 800,00')).toBeVisible()
    await expectNoAccessibilityViolations(screen.container)
  })

  it('marks an estimate and never cuts 7-digit amounts, even on a 320 px phone', async () => {
    const screen = await render(
      <div className="w-72">
        <PlanSummaryTiles
          label="Por mês"
          tiles={[
            { label: 'Contas fixas por mês', amountCents: 123456789, isEstimate: true },
            { label: 'Receitas fixas por mês', amountCents: 987654321, tone: 'income' },
          ]}
        />
      </div>,
    )
    await expect.element(screen.getByTitle('Valor aproximado')).toBeVisible()
    const frame = screen.container.firstElementChild as HTMLElement
    for (const text of ['R$ 1.234.567,89', 'R$ 9.876.543,21']) {
      const amount = screen.getByText(text).element()
      const tile = amount.closest('dd')?.parentElement as HTMLElement
      expect(amount.getBoundingClientRect().height).toBeLessThan(30)
      expect(amount.getBoundingClientRect().right).toBeLessThanOrEqual(
        tile.getBoundingClientRect().right,
      )
      expect(tile.getBoundingClientRect().right).toBeLessThanOrEqual(
        frame.getBoundingClientRect().right,
      )
    }
  })

  it('keeps the two tiles side by side on a 360 px phone when the amounts fit', async () => {
    const screen = await render(
      <div className="w-82">
        <PlanSummaryTiles
          label="Por mês"
          tiles={[
            { label: 'Contas fixas por mês', amountCents: 348970, isEstimate: true },
            { label: 'Receitas fixas por mês', amountCents: 900000, tone: 'income' },
          ]}
        />
      </div>,
    )
    const bills = screen.getByText('R$ 3.489,70').element().getBoundingClientRect()
    const income = screen.getByText('R$ 9.000,00').element().getBoundingClientRect()
    expect(bills.top).toBe(income.top)
  })
})
