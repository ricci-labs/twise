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

  it('paints an amount that is late in the danger colour', async () => {
    const screen = await render(
      <PlanSummaryTiles
        label="A receber"
        tiles={[
          { label: 'Total a receber', amountCents: 84000, tone: 'income' },
          { label: 'Em atraso', amountCents: 20000, tone: 'danger' },
        ]}
      />,
    )
    const late = screen.getByText('R$ 200,00').element().closest('dd') as HTMLElement
    const total = screen.getByText('R$ 840,00').element().closest('dd') as HTMLElement

    expect(getComputedStyle(late).color).not.toBe(getComputedStyle(total).color)
    await expectNoAccessibilityViolations(screen.container)
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
    const tiles = screen.container.querySelectorAll('dl > div')
    expect(tiles[0]?.getBoundingClientRect().width).toBe(tiles[1]?.getBoundingClientRect().width)
  })

  it('drops the second tile to its own line as soon as one amount outgrows half the row', async () => {
    const screen = await render(
      <div className="w-82">
        <PlanSummaryTiles
          label="Resumo do período"
          tiles={[
            { label: 'Falta pagar', amountCents: 125652000 },
            { label: 'Falta receber', amountCents: 9000, tone: 'income' },
          ]}
        />
      </div>,
    )
    const toPay = screen.getByText('R$ 1.256.520,00').element().getBoundingClientRect()
    const toReceive = screen.getByText('R$ 90,00').element().getBoundingClientRect()
    expect(toReceive.top).toBeGreaterThan(toPay.bottom)
    expect(toPay.height).toBeLessThan(30)
  })
})
