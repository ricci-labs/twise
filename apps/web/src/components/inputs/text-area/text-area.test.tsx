import { TextArea } from '@web/components/inputs/text-area/text-area'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'

describe('TextArea', () => {
  it('takes several lines of text, named by its label', async () => {
    const screen = await render(
      <>
        <label htmlFor="notes">Observações</label>
        <TextArea id="notes" />
      </>,
    )
    const notes = screen.getByRole('textbox', { name: 'Observações' })

    await notes.fill('Primeira linha\nSegunda linha')
    await expect.element(notes).toHaveValue('Primeira linha\nSegunda linha')
    await expectNoAccessibilityViolations(screen.container)
  })
})
