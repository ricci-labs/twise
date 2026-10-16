import { DateBlock } from '@web/components/display/date-block/date-block'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'

describe('DateBlock', () => {
  it('shows the day over the short month, hidden from screen readers', async () => {
    const screen = await render(<DateBlock date="2026-11-03" />)
    await expect.element(screen.getByText('3', { exact: true })).toBeInTheDocument()
    await expect.element(screen.getByText('nov', { exact: true })).toBeInTheDocument()
    expect(screen.container.querySelector('[data-slot=date-block]')).toHaveAttribute(
      'aria-hidden',
      'true',
    )
  })

  it('pads the day to two digits when asked', async () => {
    const screen = await render(<DateBlock date="2026-11-02" digits="padded" />)
    await expect.element(screen.getByText('02', { exact: true })).toBeInTheDocument()
  })

  it('draws a past date as an outline and the next one filled', async () => {
    const screen = await render(
      <>
        <DateBlock date="2026-01-01" tone="past" />
        <DateBlock date="2026-11-02" tone="next" />
      </>,
    )
    const [past, next] = Array.from(screen.container.querySelectorAll('[data-slot=date-block]'))
    const style = (block: Element | undefined) => (block ? getComputedStyle(block) : null)
    expect(style(past)?.boxShadow).not.toBe('none')
    expect(style(next)?.boxShadow).toBe('none')
    expect(style(past)?.backgroundColor).not.toBe(style(next)?.backgroundColor)
  })

  it('grows to 60 × 64 for the next holiday card', async () => {
    const screen = await render(<DateBlock date="2026-11-02" tone="next" size="lg" />)
    const block = screen.container.querySelector('[data-slot=date-block]')
    expect(block?.getBoundingClientRect().width).toBe(60)
    expect(block?.getBoundingClientRect().height).toBe(64)
  })
})
