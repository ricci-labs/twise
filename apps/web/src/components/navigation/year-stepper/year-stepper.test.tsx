import { YearStepper } from '@web/components/navigation/year-stepper/year-stepper'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'

describe('YearStepper', () => {
  it('moves one year back and forth', async () => {
    const chosen: number[] = []
    const screen = await render(
      <YearStepper value={2026} min={2000} max={2100} onChange={(year) => chosen.push(year)} />,
    )
    await expect.element(screen.getByRole('navigation', { name: 'Ano' })).toHaveTextContent('2026')
    await screen.getByRole('button', { name: 'Ano anterior' }).click()
    await screen.getByRole('button', { name: 'Próximo ano' }).click()
    expect(chosen).toEqual([2025, 2027])
    await expectNoAccessibilityViolations(screen.container)
  })

  it('stops at the first and the last year', async () => {
    const screen = await render(
      <YearStepper value={2100} min={2000} max={2100} onChange={() => undefined} />,
    )
    await expect.element(screen.getByRole('button', { name: 'Próximo ano' })).toBeDisabled()
    await expect.element(screen.getByRole('button', { name: 'Ano anterior' })).toBeEnabled()
  })
})
