import { LockedField } from '@web/components/forms/locked-field/locked-field'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'

describe('LockedField', () => {
  it('shows the value it keeps under its label, with the reason', async () => {
    const screen = await render(
      <LockedField label="Tipo" value="Conta corrente" help="O tipo não pode ser mudado depois." />,
    )
    const group = screen.getByRole('group', { name: 'Tipo' })

    await expect.element(group.getByText('Conta corrente')).toBeVisible()
    await expect.element(group).toHaveAccessibleDescription('O tipo não pode ser mudado depois.')
    await expectNoAccessibilityViolations(screen.container)
  })
})
