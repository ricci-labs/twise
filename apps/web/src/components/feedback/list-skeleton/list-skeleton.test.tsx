import { ListSkeleton } from '@web/components/feedback/list-skeleton/list-skeleton'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'

describe('ListSkeleton', () => {
  it('says it is loading and draws rows shaped like the list', async () => {
    const screen = await render(<ListSkeleton rows={2} />)
    const status = screen.getByRole('status')

    await expect.element(status).toHaveAttribute('aria-busy', 'true')
    await expect.element(screen.getByText('Carregando…')).toBeInTheDocument()
    expect(status.element().querySelectorAll('[aria-hidden=true]')).toHaveLength(2)
    await expectNoAccessibilityViolations(screen.container)
  })
})
