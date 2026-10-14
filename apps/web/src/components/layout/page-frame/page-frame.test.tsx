import { PageFrame } from '@web/components/layout/page-frame/page-frame'
import { afterEach, describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { render } from 'vitest-browser-react'

const PHONE_MARGIN = 16
const DESKTOP_MARGIN = 32
const DESKTOP_TOP = 32
const WIDEST = 1600

function frameOf(container: HTMLElement) {
  const frame = container.querySelector('[data-slot=page-frame]') as HTMLElement
  const style = getComputedStyle(frame)
  return {
    width: frame.getBoundingClientRect().width,
    left: Number.parseFloat(style.paddingLeft),
    top: Number.parseFloat(style.paddingTop),
  }
}

describe('PageFrame', () => {
  afterEach(async () => {
    await page.viewport(414, 896)
  })

  it('keeps the Home margins: 16 px on the phone, 32 px on the desktop', async () => {
    await page.viewport(390, 844)
    const screen = await render(
      <PageFrame>
        <p>Contas</p>
      </PageFrame>,
    )
    expect(frameOf(screen.container).left).toBe(PHONE_MARGIN)

    await page.viewport(1440, 900)
    await expect.poll(() => frameOf(screen.container).left).toBe(DESKTOP_MARGIN)
    expect(frameOf(screen.container).top).toBe(DESKTOP_TOP)
  })

  it('fills wide screens up to 1600 px, like the Home', async () => {
    await page.viewport(2200, 900)
    const screen = await render(
      <PageFrame>
        <p>Cartões</p>
      </PageFrame>,
    )
    await expect.poll(() => frameOf(screen.container).width).toBe(WIDEST)
  })

  it('lets a page reach the phone edges and keeps the desktop margins', async () => {
    await page.viewport(390, 844)
    const screen = await render(
      <PageFrame edge="bleed">
        <p>Faturas</p>
      </PageFrame>,
    )
    expect(frameOf(screen.container).left).toBe(0)
    await page.viewport(1440, 900)
    await expect.poll(() => frameOf(screen.container).left).toBe(DESKTOP_MARGIN)
  })
})
