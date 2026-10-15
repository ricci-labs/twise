import { LinkedItem } from '@web/components/finance/linked-item/linked-item'
import type { LinkedItemLinkProps } from '@web/components/finance/linked-item/linked-item.types'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'

function History({ className, children }: LinkedItemLinkProps) {
  return (
    <a href="#historico" className={className}>
      {children}
    </a>
  )
}

describe('LinkedItem', () => {
  it('is a link named by its label', async () => {
    const screen = await render(
      <LinkedItem icon="history" label="Histórico deste lançamento" link={<History />} />,
    )

    await expect
      .element(screen.getByRole('link', { name: 'Histórico deste lançamento' }))
      .toHaveAttribute('href', '#historico')
    await expectNoAccessibilityViolations(screen.container)
  })
})
