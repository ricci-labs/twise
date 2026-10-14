import { KpiSkeleton } from '@web/components/feedback/kpi-skeleton/kpi-skeleton'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'

describe('KpiSkeleton', () => {
  it('says it is loading and draws a label and a value', async () => {
    const screen = await render(<KpiSkeleton />)
    const status = screen.getByRole('status')

    await expect.element(status).toHaveAttribute('aria-busy', 'true')
    await expect.element(screen.getByText('Carregando…')).toBeInTheDocument()
    expect(status.element().querySelectorAll('[aria-hidden=true]')).toHaveLength(2)
    await expectNoAccessibilityViolations(screen.container)
  })
})
