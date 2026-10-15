import { EntryDayGroup } from '@web/components/finance/entry-day-group/entry-day-group'
import { EntryRow } from '@web/components/finance/entry-row/entry-row'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'

describe('EntryDayGroup', () => {
  it('is a region named by its day, holding its entries as a list', async () => {
    const screen = await render(
      <EntryDayGroup title="Hoje" detail="ter, 20 out">
        <EntryRow
          description="Mercado da semana"
          detail="Mercado · Conta X"
          art={{ name: 'Mercado', icon: 'groceries' }}
          amountCents={8640}
          direction="out"
        />
      </EntryDayGroup>,
    )

    const day = screen.getByRole('region', { name: 'Hoje · ter, 20 out' })
    await expect.element(day).toBeVisible()
    await expect
      .element(day.getByRole('heading', { level: 2 }))
      .toHaveTextContent('Hoje · ter, 20 out')
    await expect
      .poll(() => day.getByRole('listitem').element().textContent)
      .toMatch(/Mercado da semana/)
    await expectNoAccessibilityViolations(screen.container)
  })

  it('shows only the day when it has no detail', async () => {
    const screen = await render(
      <EntryDayGroup title="sáb, 17 out">
        <li>Uma linha</li>
      </EntryDayGroup>,
    )
    await expect.element(screen.getByRole('heading', { name: 'sáb, 17 out' })).toBeVisible()
  })
})
