import { SubcategoryAddChip } from '@web/components/finance/subcategory-add-chip/subcategory-add-chip'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'

describe('SubcategoryAddChip', () => {
  it('is a link named for the category it adds to', async () => {
    const screen = await render(
      <SubcategoryAddChip label="Nova subcategoria em Mercado" link={<a href="#nova" />} />,
    )

    await expect
      .element(screen.getByRole('link', { name: 'Nova subcategoria em Mercado' }))
      .toHaveAttribute('href', '#nova')
    await expectNoAccessibilityViolations(screen.container)
  })
})
