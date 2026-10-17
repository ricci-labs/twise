import { Avatar } from '@web/components/display/avatar/avatar'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'

describe('Avatar', () => {
  it('shows the first initial, decorative next to the name itself', async () => {
    const screen = await render(
      <p>
        <Avatar name=" member a" /> Member A
      </p>,
    )
    const avatar = screen.container.querySelector('[data-slot=avatar]')

    expect(avatar?.textContent).toBe('M')
    expect(avatar?.getAttribute('aria-hidden')).toBe('true')
    await expectNoAccessibilityViolations(screen.container)
  })

  it('keeps the paper initial dark in the dark theme, where the paper stays light', async () => {
    const light = await render(<Avatar name="Member D" tone="paper" />)
    const lightColor = getComputedStyle(
      light.container.querySelector('[data-slot=avatar]') as HTMLElement,
    ).color
    document.documentElement.classList.add('dark')
    try {
      const dark = await render(<Avatar name="Member E" tone="paper" />)
      const avatar = dark.container.querySelector('[data-slot=avatar]') as HTMLElement
      expect(getComputedStyle(avatar).color).toBe(lightColor)
    } finally {
      document.documentElement.classList.remove('dark')
    }
  })
})
