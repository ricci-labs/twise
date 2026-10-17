import { ChargePreview } from '@web/components/finance/charge-preview/charge-preview'
import type { ChargePreviewItem } from '@web/components/finance/charge-preview/charge-preview.types'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'

const MARKET: ChargePreviewItem = {
  key: 'market',
  description: 'Mercado da semana',
  dueOn: '2026-10-10',
  isOverdue: true,
  amountCents: 12000,
}

const TV: ChargePreviewItem = {
  key: 'tv',
  description: 'TV da sala (parcela 2/3)',
  dueOn: '2026-11-10',
  isOverdue: false,
  amountCents: 16000,
}

function textOf(element: Element | null | undefined): string {
  return (element?.textContent ?? '').replaceAll(' ', ' ')
}

describe('ChargePreview', () => {
  it('lists what goes in the charge with when it is due, and the total', async () => {
    const screen = await render(<ChargePreview items={[MARKET, TV]} totalCents={28000} />)

    const list = screen.getByRole('list', { name: 'Vai na cobrança · 2 itens' })
    await expect.element(list).toBeVisible()
    const rows = list.getByRole('listitem').elements()
    expect(rows.map(textOf)).toEqual([
      'Mercado da semanavenceu 10/10R$ 120,00',
      'TV da sala (parcela 2/3)vence 10/11R$ 160,00',
      'TotalR$ 280,00',
    ])
    await expectNoAccessibilityViolations(screen.container)
  })

  it('says "1 item" for a single item', async () => {
    const screen = await render(<ChargePreview items={[MARKET]} totalCents={12000} />)

    await expect.element(screen.getByText('Vai na cobrança · 1 item')).toBeVisible()
  })

  it('keeps a seven-digit amount on one line beside a long name at phone width', async () => {
    const screen = await render(
      <div className="w-80">
        <ChargePreview
          items={[
            {
              ...MARKET,
              description: 'Reforma do apartamento de Maria Aparecida dos Santos Oliveira',
              amountCents: 125652000,
            },
          ]}
          totalCents={125652000}
        />
      </div>,
    )

    const box = screen.container.querySelector('[data-slot=charge-preview]') as HTMLElement
    for (const amount of screen.getByText('R$ 1.256.520,00').elements()) {
      expect(amount.getBoundingClientRect().height).toBeLessThan(24)
    }
    expect(box.scrollWidth).toBeLessThanOrEqual(box.clientWidth)
  })
})
