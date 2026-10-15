import {
  DetailRow,
  DetailRows,
  DetailSection,
} from '@web/components/display/detail-section/detail-section'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'

describe('DetailSection', () => {
  it('is a region named by its title, with label and value pairs', async () => {
    const screen = await render(
      <DetailSection title="Detalhes" action={<a href="#cobrancas">Ver cobranças</a>}>
        <DetailRows>
          <DetailRow label="Forma de pagamento">Crédito</DetailRow>
        </DetailRows>
      </DetailSection>,
    )

    const section = screen.getByRole('region', { name: 'Detalhes' })
    await expect.element(section.getByRole('term')).toHaveTextContent('Forma de pagamento')
    await expect.element(section.getByRole('definition')).toHaveTextContent('Crédito')
    await expect.element(section.getByRole('link', { name: 'Ver cobranças' })).toBeVisible()
    await expectNoAccessibilityViolations(screen.container)
  })
})
