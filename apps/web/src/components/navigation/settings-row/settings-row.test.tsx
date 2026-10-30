import { SettingsRow } from '@web/components/navigation/settings-row/settings-row'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { expectClampedToTwoLines, supportLineOf } from '@web/testing/long-text'
import { describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { render } from 'vitest-browser-react'

const LONG_DETAIL =
  '15 em 2026 · próximo: Aniversário da cidade e padroeira municipal com feriado prolongado, 02/11'

describe('SettingsRow', () => {
  it('is a link named by its title and its state line', async () => {
    const screen = await render(
      <ul>
        <SettingsRow
          title="Feriados"
          detail="15 em 2026 · próximo: Finados, 02/11"
          icon="calendar"
          link={<a href="#feriados" />}
        />
      </ul>,
    )
    await expect
      .element(screen.getByRole('link', { name: /Feriados 15 em 2026 · próximo: Finados, 02\/11/ }))
      .toHaveAttribute('href', '#feriados')
    await expectNoAccessibilityViolations(screen.container)
  })

  it('clamps a long state line to two lines at 360 px', async () => {
    await page.viewport(360, 640)
    const screen = await render(
      <ul>
        <SettingsRow
          title="Feriados"
          detail={LONG_DETAIL}
          icon="calendar"
          link={<a href="#feriados" />}
        />
      </ul>,
    )
    expectClampedToTwoLines(supportLineOf(screen.container))
  })
})
