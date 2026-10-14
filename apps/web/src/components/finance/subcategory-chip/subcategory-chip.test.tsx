import { SubcategoryChip } from '@web/components/finance/subcategory-chip/subcategory-chip'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'

describe('SubcategoryChip', () => {
  it('opens the actions of a subcategory, and is only text when it has none', async () => {
    const onClick = vi.fn()
    const screen = await render(
      <div>
        <SubcategoryChip
          label="Feira"
          aria-label="Feira, subcategoria de Mercado: ações"
          onClick={onClick}
        />
        <SubcategoryChip label="Padaria" tone="plain" />
      </div>,
    )

    await screen.getByRole('button', { name: 'Feira, subcategoria de Mercado: ações' }).click()
    expect(onClick).toHaveBeenCalledOnce()
    await expect.element(screen.getByRole('button', { name: /Padaria/ })).not.toBeInTheDocument()
    await expectNoAccessibilityViolations(screen.container)
  })
})
