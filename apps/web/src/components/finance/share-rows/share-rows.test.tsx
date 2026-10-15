import { ShareRows } from '@web/components/finance/share-rows/share-rows'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'

describe('ShareRows', () => {
  it('lists what each contact owes and closes with "Sua parte"', async () => {
    const screen = await render(
      <ShareRows
        shares={[
          { key: 'c', name: 'Member C', amountCents: 8000 },
          { key: 'd', name: 'Member D', amountCents: 6000 },
        ]}
        ownCents={10000}
        note="Cada contato passa a dever a parte dele."
      />,
    )

    const items = screen.getByRole('listitem')
    await expect
      .poll(() => items.elements().map((item) => item.textContent?.replace(/\s/g, ' ')))
      .toEqual(['MMember CR$ 80,00', 'MMember DR$ 60,00', 'Sua parteR$ 100,00'])
    await expect.element(screen.getByText('Cada contato passa a dever a parte dele.')).toBeVisible()
    await expectNoAccessibilityViolations(screen.container)
  })
})
