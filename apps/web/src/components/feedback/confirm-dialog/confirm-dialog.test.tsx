import { ConfirmDialog } from '@web/components/feedback/confirm-dialog/confirm-dialog'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'
import { render } from 'vitest-browser-react'

function renderDialog() {
  const onOpenChange = vi.fn()
  const onConfirm = vi.fn()
  render(
    <ConfirmDialog
      title="Descartar as alterações?"
      description="O que você preencheu neste lançamento vai se perder."
      cancelLabel="Continuar editando"
      confirmLabel="Descartar"
      isOpen
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
    />,
  )
  return { onOpenChange, onConfirm }
}

describe('ConfirmDialog', () => {
  it('asks before a hard-to-undo action and confirms it', async () => {
    const { onConfirm } = renderDialog()

    await expect
      .element(page.getByRole('alertdialog', { name: 'Descartar as alterações?' }))
      .toBeVisible()
    await page.getByRole('button', { name: 'Descartar' }).click()
    expect(onConfirm).toHaveBeenCalledOnce()
    await expectNoAccessibilityViolations(document.body)
  })

  it('closes without confirming when the person keeps editing', async () => {
    const { onOpenChange, onConfirm } = renderDialog()

    await page.getByRole('button', { name: 'Continuar editando' }).click()
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(onConfirm).not.toHaveBeenCalled()
  })
})

describe('ConfirmDialog as a refusal', () => {
  it('names the item and offers the way out as the main button, with its icon', async () => {
    const onConfirm = vi.fn()
    render(
      <ConfirmDialog
        title="Não dá para excluir a Conta Y"
        description="Esta conta tem lançamentos ou subcategorias. Arquive em vez de excluir."
        cancelLabel="Cancelar"
        confirmLabel="Arquivar"
        confirmVariant="primary"
        confirmIcon="archive"
        isOpen
        onOpenChange={vi.fn()}
        onConfirm={onConfirm}
      />,
    )
    const wayOut = page.getByRole('button', { name: 'Arquivar' })

    await expect
      .element(page.getByRole('alertdialog', { name: 'Não dá para excluir a Conta Y' }))
      .toBeVisible()
    expect(wayOut.element().querySelector('[data-icon=archive]')).not.toBeNull()
    await wayOut.click()
    expect(onConfirm).toHaveBeenCalledOnce()
    await expectNoAccessibilityViolations(document.body)
  })
})
