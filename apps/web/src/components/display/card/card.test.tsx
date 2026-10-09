import { Card } from '@web/components/display/card/card'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'

describe('Card', () => {
  it('is a region named by its title, with the footer only when given', async () => {
    const screen = await render(
      <main>
        <Card title="Avisos" description="Os mais urgentes primeiro.">
          <p>Tudo em ordem por aqui.</p>
        </Card>
      </main>,
    )

    await expect.element(screen.getByRole('region', { name: 'Avisos' })).toBeVisible()
    await expect.element(screen.getByRole('heading', { level: 2, name: 'Avisos' })).toBeVisible()
    expect(screen.container.querySelector('[data-slot=card-foot]')).toBeNull()
    await expectNoAccessibilityViolations(screen.container)
  })

  it('drops a footer whose parts are all hidden, and puts a lone link on the left', async () => {
    const screen = await render(
      <main>
        <Card title="Comissões" footerStat={false} footerAction={false}>
          <p>Sem dividir.</p>
        </Card>
        <Card title="Faturas" footerAction={<a href="/cards">Ver cartões</a>}>
          <p>Cartão X</p>
        </Card>
      </main>,
    )

    const feet = screen.container.querySelectorAll('[data-slot=card-foot]')
    expect(feet).toHaveLength(1)
    const link = screen.getByRole('link', { name: 'Ver cartões' }).element()
    const foot = feet[0] as Element
    expect(link.getBoundingClientRect().left).toBe(
      foot.getBoundingClientRect().left + Number.parseFloat(getComputedStyle(foot).paddingLeft),
    )
  })
})
