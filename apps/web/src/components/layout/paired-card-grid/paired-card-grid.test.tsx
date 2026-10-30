import { Card } from '@web/components/display/card'
import { PairedCardGrid } from '@web/components/layout/paired-card-grid/paired-card-grid'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { afterEach, describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { render } from 'vitest-browser-react'

const LONG_TEXT = 'Uma linha bem longa que ocupa espaço. '.repeat(12)

function boxesOf(container: HTMLElement): DOMRect[] {
  return Array.from(container.querySelectorAll('[data-slot=card]')).map((card) =>
    card.getBoundingClientRect(),
  )
}

describe('PairedCardGrid', () => {
  afterEach(async () => {
    await page.viewport(414, 896)
  })

  it('gives the two cards of a row the same height, and a spanning card the whole row', async () => {
    await page.viewport(1440, 900)
    const screen = await render(
      <PairedCardGrid>
        <Card title="Curto">Casa</Card>
        <Card title="Longo">{LONG_TEXT}</Card>
        <Card title="Linha toda" className="lg:col-span-2">
          Cada um tem a sua tela.
        </Card>
      </PairedCardGrid>,
    )
    const [short, long, wide] = boxesOf(screen.container)

    expect(short?.top).toBe(long?.top)
    expect(short?.height).toBe(long?.height)
    expect(wide?.width).toBeGreaterThan((short?.width ?? 0) * 2)
    await expectNoAccessibilityViolations(screen.container)
  })

  it('stacks the cards on the phone', async () => {
    await page.viewport(390, 844)
    const screen = await render(
      <PairedCardGrid>
        <Card title="Um">Casa</Card>
        <Card title="Dois">Domingo</Card>
      </PairedCardGrid>,
    )
    const [first, second] = boxesOf(screen.container)

    expect(second?.top).toBeGreaterThan(first?.bottom ?? 0)
  })
})
