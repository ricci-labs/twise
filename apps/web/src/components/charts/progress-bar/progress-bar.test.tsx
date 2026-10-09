import { ProgressBar } from '@web/components/charts/progress-bar/progress-bar'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'

describe('ProgressBar', () => {
  it('fills up to the limit at most and marks where the pace is', async () => {
    const screen = await render(<ProgressBar percent={115} markPercent={52} tone="over" />)
    const [, fill, mark] = [...screen.container.querySelectorAll('rect')]

    expect(fill?.getAttribute('width')).toBe('100%')
    expect(mark?.getAttribute('x')).toBe('52%')
    expect(screen.container.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true')
  })
})
