import { FormOverlay } from '@web/components/layout/form-overlay/form-overlay'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it, vi } from 'vitest'
import { page, userEvent } from 'vitest/browser'
import { render } from 'vitest-browser-react'

function renderOverlay() {
  const onRequestClose = vi.fn()
  render(
    <FormOverlay
      title="Novo lançamento"
      closeLabel="Cancelar"
      isOpen
      onRequestClose={onRequestClose}
      footer={<button type="button">Salvar lançamento</button>}
    >
      <p>Campos</p>
    </FormOverlay>,
  )
  return onRequestClose
}

describe('FormOverlay', () => {
  it('is a dialog named by its title, with the footer always in view', async () => {
    renderOverlay()

    await expect.element(page.getByRole('dialog', { name: 'Novo lançamento' })).toBeVisible()
    await expect.element(page.getByRole('button', { name: 'Salvar lançamento' })).toBeVisible()
    await expectNoAccessibilityViolations(document.body)
  })

  it('holds a form when given onSubmit, so Enter and the footer buttons submit it', async () => {
    const onSubmit = vi.fn((event: { preventDefault: () => void }) => event.preventDefault())
    render(
      <FormOverlay
        title="Novo lançamento"
        closeLabel="Cancelar"
        isOpen
        onRequestClose={vi.fn()}
        onSubmit={onSubmit}
        footer={<button type="submit">Salvar lançamento</button>}
      >
        <input aria-label="Descrição" />
      </FormOverlay>,
    )

    await page.getByRole('textbox', { name: 'Descrição' }).fill('Feira')
    await userEvent.keyboard('{Enter}')
    await page.getByRole('button', { name: 'Salvar lançamento' }).click()
    expect(onSubmit).toHaveBeenCalledTimes(2)
    await expectNoAccessibilityViolations(document.body)
  })

  it('asks the screen before closing, from the button or Escape', async () => {
    const onRequestClose = renderOverlay()

    await page.getByRole('button', { name: 'Cancelar' }).click()
    await userEvent.keyboard('{Escape}')
    expect(onRequestClose).toHaveBeenCalledTimes(2)
    await expect.element(page.getByRole('dialog', { name: 'Novo lançamento' })).toBeVisible()
  })
})
