import { useLightTheme } from '@web/hooks/use-light-theme'
import { useSystemBarColor } from '@web/hooks/use-system-bar-color'
import type { SystemBarColor } from '@web/lib/system-bar.types'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'

const DARK_CLASS = 'dark'

let meta: HTMLMetaElement

function tokenIn(theme: 'light' | 'dark', token: string): string {
  const root = document.documentElement
  const wasDark = root.classList.contains(DARK_CLASS)
  root.classList.toggle(DARK_CLASS, theme === 'dark')
  const value = getComputedStyle(root).getPropertyValue(`--${token}`).trim()
  root.classList.toggle(DARK_CLASS, wasDark)
  return value
}

function TopOfScreen({ color }: { color: SystemBarColor }) {
  useSystemBarColor(color)
  return null
}

function LightScreen() {
  useLightTheme()
  useSystemBarColor('mint')
  return null
}

function LightPage() {
  useLightTheme()
  return null
}

describe('useSystemBarColor', () => {
  beforeEach(() => {
    meta = document.querySelector('meta[name="theme-color"]') ?? document.createElement('meta')
    meta.name = 'theme-color'
    meta.content = tokenIn('light', 'bg-page')
    document.head.append(meta)
  })

  afterEach(() => {
    document.documentElement.classList.remove(DARK_CLASS)
  })

  it('paints the bar and the strip under it with the colour at the top of the screen, then the page', async () => {
    const screen = await render(<TopOfScreen color="mint" />)
    expect(meta.content).toBe(tokenIn('light', 'mint'))
    expect(document.documentElement.style.getPropertyValue('--system-bar')).toBe(
      tokenIn('light', 'mint'),
    )

    await screen.unmount()
    expect(meta.content).toBe(tokenIn('light', 'bg-page'))
  })

  it('keeps the dark strip of a banner over the colour of the screen under it', async () => {
    const screen = await render(
      <>
        <TopOfScreen color="ink" />
        <TopOfScreen color="mint" />
      </>,
    )
    expect(meta.content).toBe(tokenIn('light', 'ink'))

    await screen.rerender(<TopOfScreen color="mint" />)
    expect(meta.content).toBe(tokenIn('light', 'mint'))
  })

  it('follows the dark theme back after a screen that is always light', async () => {
    document.documentElement.classList.add(DARK_CLASS)
    const screen = await render(<LightScreen />)
    expect(meta.content).toBe(tokenIn('light', 'mint'))

    await screen.unmount()
    expect(meta.content).toBe(tokenIn('dark', 'bg-page'))
  })

  it('paints the light page under a screen that is always light, also in the dark theme', async () => {
    document.documentElement.classList.add(DARK_CLASS)
    meta.content = tokenIn('dark', 'bg-page')
    const screen = await render(<LightPage />)
    expect(meta.content).toBe(tokenIn('light', 'bg-page'))

    await screen.unmount()
    expect(meta.content).toBe(tokenIn('dark', 'bg-page'))
  })
})
