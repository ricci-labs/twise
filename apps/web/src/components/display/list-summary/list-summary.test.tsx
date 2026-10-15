import { ListSummary } from '@web/components/display/list-summary/list-summary'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'

describe('ListSummary', () => {
  it('says what went out, what came in and how many entries', async () => {
    const screen = await render(<ListSummary outCents={650520} inCents={912000} count={11} />)
    const summary = screen.getByRole('status')

    await expect
      .poll(() => summary.element().textContent?.replace(/\s/g, ' '))
      .toBe('Saiu R$ 6.505,20Entrou R$ 9.120,0011 lançamentos')
    await expectNoAccessibilityViolations(screen.container)
  })

  it('leaves out a side with nothing and counts one entry in the singular', async () => {
    const screen = await render(<ListSummary outCents={0} inCents={12000} count={1} />)

    await expect.element(screen.getByText(/Saiu/)).not.toBeInTheDocument()
    await expect.element(screen.getByText('1 lançamento')).toBeVisible()
  })
})
