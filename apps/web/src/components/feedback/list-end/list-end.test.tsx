import { ListEnd } from '@web/components/feedback/list-end/list-end'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'

function PreviousLink({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <a href="#anterior" className={className}>
      {children}
    </a>
  )
}

describe('ListEnd', () => {
  it('says the list is over and leads to the previous period', async () => {
    const screen = await render(
      <ListEnd
        message="Isso é tudo de out/26."
        previous={{ label: 'Ver set/26', link: <PreviousLink /> }}
      />,
    )

    await expect.element(screen.getByText('Isso é tudo de out/26.')).toBeVisible()
    await expect
      .element(screen.getByRole('link', { name: 'Ver set/26' }))
      .toHaveAttribute('href', '#anterior')
    await expectNoAccessibilityViolations(screen.container)
  })

  it('shows only the sentence without a previous period', async () => {
    const screen = await render(<ListEnd message="Isso é tudo com esses filtros em out/26." />)
    await expect.element(screen.getByRole('link')).not.toBeInTheDocument()
  })
})
