import { TwiseIcon } from '@web/components/icons/twise-icon/twise-icon'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'

const fillOf = (container: HTMLElement) => {
  const fill = container.querySelector('[data-slot=icon-fill] > *')
  return fill ? getComputedStyle(fill).fill : null
}

describe('TwiseIcon', () => {
  it('is decorative: hidden from screen readers, never focusable', async () => {
    const screen = await render(
      <button type="button" aria-label="Início">
        <TwiseIcon name="home" />
      </button>,
    )
    const icon = screen.container.querySelector('svg')
    expect(icon?.getAttribute('aria-hidden')).toBe('true')
    expect(icon?.getAttribute('focusable')).toBe('false')
    await expectNoAccessibilityViolations(screen.container)
  })

  it('shows its inner fill only as an accent or in an alert', async () => {
    const atRest = await render(<TwiseIcon name="card" tone="muted" />)
    expect(fillOf(atRest.container)).toBe('none')
    const accent = await render(<TwiseIcon name="card" tone="accent" />)
    expect(fillOf(accent.container)).not.toBe('none')
  })

  it('has no fill layer for the plain glyphs', async () => {
    const screen = await render(<TwiseIcon name="plus" tone="accent" />)
    expect(screen.container.querySelector('[data-slot=icon-fill]')).toBeNull()
  })
})
