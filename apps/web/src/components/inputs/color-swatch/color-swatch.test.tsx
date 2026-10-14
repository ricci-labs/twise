import { ColorSwatch } from '@web/components/inputs/color-swatch/color-swatch'
import { ACCOUNT_COLORS } from '@web/styles/account-colors'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'

const BLUE = ACCOUNT_COLORS[0].value
const GREY = ACCOUNT_COLORS[7].value
const DOT_SIZE = 9
const SWATCH_SIZE = 36

function swatchIn(container: HTMLElement): HTMLElement {
  return container.querySelector('[data-slot=color-swatch]') as HTMLElement
}

describe('ColorSwatch', () => {
  it('draws the stored colour as a decorative 9 px dot', async () => {
    const screen = await render(<ColorSwatch color={BLUE} />)
    const dot = swatchIn(screen.container)

    expect(dot.getAttribute('aria-hidden')).toBe('true')
    expect(dot.style.getPropertyValue('--data-color')).toBe(BLUE)
    expect(getComputedStyle(dot).backgroundColor).not.toBe(
      getComputedStyle(screen.container).backgroundColor,
    )
    expect(dot.getBoundingClientRect().width).toBe(DOT_SIZE)
  })

  it('lightens the grey on the dark theme, so it still reads', async () => {
    const screen = await render(
      <div>
        <ColorSwatch color={GREY} size="swatch" />
        <div className="dark">
          <ColorSwatch color={GREY} size="swatch" />
        </div>
      </div>,
    )
    const [light, dark] = [
      ...screen.container.querySelectorAll<HTMLElement>('[data-slot=color-swatch]'),
    ]

    expect(getComputedStyle(dark as HTMLElement).backgroundColor).not.toBe(
      getComputedStyle(light as HTMLElement).backgroundColor,
    )
    expect(light?.getBoundingClientRect().width).toBe(SWATCH_SIZE)
  })

  it('draws nothing without a colour', async () => {
    const screen = await render(<ColorSwatch color={null} />)
    expect(swatchIn(screen.container)).toBeNull()
  })
})
