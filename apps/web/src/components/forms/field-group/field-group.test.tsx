import { FieldGroup } from '@web/components/forms/field-group/field-group'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'

describe('FieldGroup', () => {
  it('names a group of choices and describes it with its help and error', async () => {
    const screen = await render(
      <FieldGroup
        label="Tipo"
        isRequired
        help="O tipo não pode ser mudado depois."
        error="Escolha um tipo."
      >
        <button type="button">Conta corrente</button>
      </FieldGroup>,
    )
    const group = screen.getByRole('group', { name: 'Tipo' })

    await expect.element(group).toBeVisible()
    await expect
      .element(group)
      .toHaveAccessibleDescription('O tipo não pode ser mudado depois. Escolha um tipo.')
    await expectNoAccessibilityViolations(screen.container)
  })

  it('puts the note after the choices and describes the group with it', async () => {
    const screen = await render(
      <FieldGroup label="Quando" note="Se o mês tiver menos dias, vale o último.">
        <button type="button">No dia 10 do mês</button>
      </FieldGroup>,
    )
    const group = screen.getByRole('group', { name: 'Quando' })
    await expect
      .element(group)
      .toHaveAccessibleDescription('Se o mês tiver menos dias, vale o último.')
    const button = screen.getByRole('button').element()
    const note = screen.getByText('Se o mês tiver menos dias, vale o último.').element()
    expect(button.compareDocumentPosition(note)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    await expectNoAccessibilityViolations(screen.container)
  })
})
