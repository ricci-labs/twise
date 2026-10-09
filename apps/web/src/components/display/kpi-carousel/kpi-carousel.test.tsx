import { KpiCarousel } from '@web/components/display/kpi-carousel/kpi-carousel'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { afterEach, describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { render } from 'vitest-browser-react'

const SLIDES = ['Livre para gastar', 'Renda do orçamento', 'Gasto', 'Comprometido'].map((label) => (
  <p key={label} className="h-24 rounded-lg border border-border bg-surface p-4">
    {label} <button type="button">?</button>
  </p>
))

describe('KpiCarousel', () => {
  afterEach(async () => {
    await page.viewport(414, 896)
  })

  it('reads each card as "n de 4" and moves with its dots on the phone', async () => {
    await page.viewport(390, 844)
    const screen = await render(
      <main>
        <KpiCarousel>{SLIDES}</KpiCarousel>
      </main>,
    )

    await expect.element(screen.getByRole('group', { name: '2 de 4' })).toBeInTheDocument()
    const first = screen.getByRole('button', { name: 'Ir para o indicador 1' })
    await expect.element(first).toHaveAttribute('aria-current', 'true')

    await screen.getByRole('button', { name: 'Ir para o indicador 3' }).click()

    await expect
      .element(screen.getByRole('button', { name: 'Ir para o indicador 3' }))
      .toHaveAttribute('aria-current', 'true')
    await expectNoAccessibilityViolations(screen.container)
  })

  it('lays the four cards side by side from 1024 px, without dots', async () => {
    await page.viewport(1440, 900)
    const screen = await render(
      <main>
        <KpiCarousel>{SLIDES}</KpiCarousel>
      </main>,
    )
    const tops = [...screen.container.querySelectorAll('[role=group]')].map(
      (slide) => slide.getBoundingClientRect().top,
    )

    expect(new Set(tops).size).toBe(1)
    const dots = screen.container.querySelector('button[aria-label^="Ir para"]')?.parentElement
    expect(dots && getComputedStyle(dots).display).toBe('none')
  })
})
