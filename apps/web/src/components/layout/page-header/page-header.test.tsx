import { PageHeader } from '@web/components/layout/page-header/page-header'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { render } from 'vitest-browser-react'

describe('PageHeader', () => {
  it('titles the page and explains it on the desktop only', async () => {
    await page.viewport(1440, 900)
    const screen = await render(
      <PageHeader
        title="Cartões"
        description="Faturas, limites e o melhor dia de comprar em cada cartão."
        actions={<button type="button">Novo cartão</button>}
      />,
    )

    await expect.element(screen.getByRole('heading', { name: 'Cartões', level: 1 })).toBeVisible()
    await expect.element(screen.getByText(/Faturas, limites/)).toBeVisible()
    await expectNoAccessibilityViolations(screen.container)

    await page.viewport(390, 844)
    await expect.element(screen.getByText(/Faturas, limites/)).not.toBeVisible()
  })
})
