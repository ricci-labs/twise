import { CategoryRow } from '@web/components/finance/category-row/category-row'
import { SubcategoryChip } from '@web/components/finance/subcategory-chip'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'

describe('CategoryRow', () => {
  it('shows how many subcategories it has and opens them', async () => {
    const onOpenChange = vi.fn()
    const screen = await render(
      <ul>
        <CategoryRow
          name="Mercado"
          icon="groceries"
          subcategoryCount={2}
          isOpen={false}
          onOpenChange={onOpenChange}
        >
          <SubcategoryChip label="Feira" tone="plain" />
        </CategoryRow>
      </ul>,
    )
    const toggle = screen.getByRole('button', { name: 'Mostrar 2 subcategorias de Mercado' })

    await expect.element(toggle).toHaveAttribute('aria-expanded', 'false')
    await expect.element(toggle).toHaveTextContent('2 subcategorias')
    await toggle.click()
    expect(onOpenChange).toHaveBeenCalledWith(true, expect.anything())
    await expectNoAccessibilityViolations(screen.container)
  })

  it('keeps the subcategories of an archived row in view', async () => {
    const screen = await render(
      <ul>
        <CategoryRow name="Viagem" icon="travel" detail="Categoria de despesa · com Hotel">
          <SubcategoryChip label="Hotel" tone="archived" />
        </CategoryRow>
      </ul>,
    )

    await expect.element(screen.getByText('Hotel')).toBeVisible()
    await expect.element(screen.getByRole('button')).not.toBeInTheDocument()
  })
})
