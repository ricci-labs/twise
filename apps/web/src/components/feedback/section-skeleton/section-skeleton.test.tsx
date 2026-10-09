import { SectionSkeleton } from '@web/components/feedback/section-skeleton/section-skeleton'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'

describe('SectionSkeleton', () => {
  it('tells screen readers the section is loading, drawing only decorative blocks', async () => {
    const screen = await render(<SectionSkeleton hasChart />)

    await expect.element(screen.getByRole('status')).toHaveTextContent('Carregando…')
    await expect.element(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true')
    await expectNoAccessibilityViolations(screen.container)
  })
})
