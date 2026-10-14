import { ScrollArrows } from '@web/components/navigation/scroll-arrows/scroll-arrows'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { useRef } from 'react'
import { describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { render } from 'vitest-browser-react'

const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

function Strip({ months }: { months: readonly string[] }) {
  const stripRef = useRef<HTMLUListElement>(null)
  return (
    <div className="w-100">
      <ScrollArrows scrollerRef={stripRef}>
        <ul ref={stripRef} aria-label="Meses" className="flex gap-2 overflow-x-auto scrollbar-none">
          {months.map((month) => (
            <li key={month} className="w-24 shrink-0">
              <button type="button">{month}</button>
            </li>
          ))}
        </ul>
      </ScrollArrows>
    </div>
  )
}

describe('ScrollArrows', () => {
  it('shows an arrow only on the side with more to see, and scrolls by it', async () => {
    await page.viewport(1280, 800)
    const screen = await render(<Strip months={MONTHS} />)
    const strip = screen.getByRole('list', { name: 'Meses' }).element() as HTMLElement

    await expect.element(screen.getByRole('button', { name: 'Ver próximos' })).toBeVisible()
    await expect
      .element(screen.getByRole('button', { name: 'Ver anteriores' }))
      .not.toBeInTheDocument()

    await screen.getByRole('button', { name: 'Ver próximos' }).click()
    await expect.poll(() => strip.scrollLeft).toBeGreaterThan(0)
    await expect.element(screen.getByRole('button', { name: 'Ver anteriores' })).toBeVisible()

    strip.scrollLeft = strip.scrollWidth
    await expect
      .element(screen.getByRole('button', { name: 'Ver próximos' }))
      .not.toBeInTheDocument()
    await expectNoAccessibilityViolations(screen.container)
  })

  it('shows no arrows when everything fits', async () => {
    await page.viewport(1280, 800)
    const screen = await render(<Strip months={MONTHS.slice(0, 2)} />)

    await expect.element(screen.getByRole('list', { name: 'Meses' })).toBeVisible()
    await expect
      .element(screen.getByRole('button', { name: 'Ver próximos' }))
      .not.toBeInTheDocument()
  })

  it('leaves the phone to swipe', async () => {
    await page.viewport(390, 844)
    const screen = await render(<Strip months={MONTHS} />)
    const arrow = () => screen.container.querySelector<HTMLElement>('[aria-label="Ver próximos"]')

    await expect.poll(arrow).not.toBeNull()
    expect(arrow()?.checkVisibility()).toBe(false)
  })
})
