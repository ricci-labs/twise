import { SubcategoryChip } from '@web/components/finance/subcategory-chip'
import { SubcategoryChips } from '@web/components/finance/subcategory-chips/subcategory-chips'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'

const LABELS = ['Aluguel', 'Condomínio', 'Luz e água', 'Internet', 'Gás', 'IPTU', 'Manutenção']

function chipsFor(labels: readonly string[]) {
  return labels.map((label) => <SubcategoryChip key={label} label={label} />)
}

describe('SubcategoryChips', () => {
  it('shows every chip when they fit on one line', async () => {
    const onHiddenCountChange = vi.fn()
    const screen = await render(
      <div className="w-200">
        <SubcategoryChips
          labels={LABELS}
          chips={chipsFor(LABELS)}
          isExpanded={false}
          onExpandedChange={vi.fn()}
          onHiddenCountChange={onHiddenCountChange}
        />
      </div>,
    )

    await expect.element(screen.getByRole('button', { name: 'Manutenção' })).toBeVisible()
    await expect.element(screen.getByRole('button', { name: /mais/ })).not.toBeInTheDocument()
    expect(onHiddenCountChange).toHaveBeenLastCalledWith(0)
    await expectNoAccessibilityViolations(screen.container)
  })

  it('keeps one line with a "+N mais" chip, and opens every chip with "Mostrar menos"', async () => {
    const onExpandedChange = vi.fn()
    const screen = await render(
      <div className="w-60">
        <SubcategoryChips
          labels={LABELS}
          chips={chipsFor(LABELS)}
          isExpanded={false}
          onExpandedChange={onExpandedChange}
        />
      </div>,
    )

    const more = screen.getByRole('button', { name: /^\+\d+ mais$/ })
    await expect.element(screen.getByRole('button', { name: 'Manutenção' })).not.toBeInTheDocument()
    await expect.element(more).toHaveAttribute('aria-expanded', 'false')
    await more.click()
    expect(onExpandedChange).toHaveBeenCalledWith(true)

    await screen.rerender(
      <div className="w-60">
        <SubcategoryChips
          labels={LABELS}
          chips={chipsFor(LABELS)}
          isExpanded
          onExpandedChange={onExpandedChange}
        />
      </div>,
    )
    await expect.element(screen.getByRole('button', { name: 'Manutenção' })).toBeVisible()
    await screen.getByRole('button', { name: 'Mostrar menos' }).click()
    expect(onExpandedChange).toHaveBeenLastCalledWith(false)
    await expectNoAccessibilityViolations(screen.container)
  })
})
