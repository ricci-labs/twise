import { BeforeAfterTiles } from '@web/components/display/before-after-tiles/before-after-tiles'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { LONG_TEXT } from '@web/testing/long-text'
import { describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { render } from 'vitest-browser-react'

describe('BeforeAfterTiles', () => {
  it('shows the new value large with "antes" below the label', async () => {
    const screen = await render(
      <BeforeAfterTiles
        items={[{ label: 'Livre para gastar', beforeCents: 234000, afterCents: 180000 }]}
      />,
    )

    const tile = screen.getByRole('listitem')
    await expect.element(tile.getByText('Livre para gastar')).toBeVisible()
    await expect.element(tile.getByText('R$\u00a01.800,00')).toBeVisible()
    await expect.element(tile.getByText('antes R$\u00a02.340,00')).toBeVisible()
    await expectNoAccessibilityViolations(screen.container)
  })

  it('says "sem mudança" when nothing changes and paints a negative value red', async () => {
    const screen = await render(
      <BeforeAfterTiles
        layout="tiles"
        items={[
          { label: 'Por dia', beforeCents: 14625, afterCents: 14625 },
          { label: 'Livre para gastar', beforeCents: 234000, afterCents: -92000 },
        ]}
      />,
    )

    await expect.element(screen.getByText('sem mudança')).toBeVisible()
    const negative = screen.getByText('-R$\u00a0920,00').element()
    expect(negative.className).toContain('text-danger')
  })

  it('never wraps the value at 360 px, even with 9 digits and a long label', async () => {
    await page.viewport(360, 640)
    const screen = await render(
      <BeforeAfterTiles
        items={[
          {
            label: `Saldo de hoje da ${LONG_TEXT.account}`,
            beforeCents: 312000,
            afterCents: LONG_TEXT.amountCents,
          },
        ]}
      />,
    )

    const value = screen.getByText(LONG_TEXT.amount).element() as HTMLElement
    expect(value.getBoundingClientRect().height).toBeLessThan(40)
    const tile = screen.getByRole('listitem').element()
    expect(value.getBoundingClientRect().right).toBeLessThanOrEqual(
      tile.getBoundingClientRect().right + 1,
    )
  })

  it('shrinks the value to fit a narrow tile instead of breaking out of it', async () => {
    await page.viewport(1440, 900)
    const screen = await render(
      <div className="w-140">
        <BeforeAfterTiles
          layout="tiles"
          items={[
            { label: 'Livre para gastar', beforeCents: 234000, afterCents: -2383084 },
            { label: 'Por dia', beforeCents: 14625, afterCents: 0 },
            { label: 'Limite livre', beforeCents: 950000, afterCents: -124670000 },
          ]}
        />
      </div>,
    )

    for (const tile of screen.getByRole('listitem').elements()) {
      const value = tile.querySelector('strong') as HTMLElement
      expect(value.scrollWidth).toBeLessThanOrEqual(tile.clientWidth)
    }
  })
})
