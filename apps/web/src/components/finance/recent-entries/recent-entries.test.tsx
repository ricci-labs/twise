import { RecentEntries } from '@web/components/finance/recent-entries/recent-entries'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'

const ENTRIES = [
  { key: 'groceries', description: 'Mercado da semana', icon: 'groceries', amountCents: 8640 },
  { key: 'uber', description: 'Uber', icon: 'transport', amountCents: 2390 },
]

const CARD_HEIGHT = 58

describe('RecentEntries', () => {
  it('offers the entries to repeat with their last amount, marking the one picked', async () => {
    const onPick = vi.fn()
    const screen = await render(
      <RecentEntries entries={ENTRIES} pickedKey="uber" onPick={onPick} />,
    )

    await expect.element(screen.getByRole('region', { name: 'Repetir um recente' })).toBeVisible()
    await expect
      .element(screen.getByRole('button', { name: /Uber/ }))
      .toHaveAttribute('aria-pressed', 'true')
    await screen.getByRole('button', { name: /Mercado da semana/ }).click()
    expect(onPick).toHaveBeenCalledWith('groceries')
    await expectNoAccessibilityViolations(screen.container)
  })

  it('keeps each card on one line, however narrow the row', async () => {
    const screen = await render(
      <div className="w-60">
        <RecentEntries entries={ENTRIES} pickedKey={null} onPick={vi.fn()} />
      </div>,
    )
    const card = screen.getByRole('button', { name: /Mercado da semana/ })

    await expect.element(card).toBeVisible()
    expect(card.element().getBoundingClientRect().height).toBe(CARD_HEIGHT)
  })

  it('disappears when there is nothing to repeat', async () => {
    const screen = await render(<RecentEntries entries={[]} pickedKey={null} onPick={vi.fn()} />)
    expect(screen.container.querySelector('[data-slot=recent-entries]')).toBeNull()
  })
})
