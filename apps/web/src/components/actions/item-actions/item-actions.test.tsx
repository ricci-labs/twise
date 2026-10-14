import { ItemActions } from '@web/components/actions/item-actions/item-actions'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'
import { render } from 'vitest-browser-react'

function renderActions(onArchive = vi.fn(), onDelete = vi.fn()) {
  render(
    <ItemActions
      title="Feira"
      description="Subcategoria de Mercado"
      triggerLabel="Feira, subcategoria de Mercado: ações"
      actions={[
        { key: 'edit', label: 'Editar', icon: 'edit' },
        { key: 'archive', label: 'Arquivar', icon: 'archive', onSelect: onArchive },
        { key: 'delete', label: 'Excluir', icon: 'trash', tone: 'danger', onSelect: onDelete },
      ]}
    />,
  )
  return { onArchive, onDelete }
}

describe('ItemActions', () => {
  afterEach(async () => {
    await page.viewport(414, 896)
  })

  it('opens a sheet named after the item on the phone, and closes after a choice', async () => {
    const { onArchive } = renderActions()
    await page.getByRole('button', { name: 'Feira, subcategoria de Mercado: ações' }).click()
    const sheet = page.getByRole('dialog', { name: 'Feira' })

    await expect.element(sheet).toBeVisible()
    await expect.element(sheet.getByText('Subcategoria de Mercado')).toBeVisible()
    await expectNoAccessibilityViolations(sheet.element())
    await sheet.getByRole('button', { name: 'Arquivar' }).click()

    expect(onArchive).toHaveBeenCalledOnce()
    await expect.element(sheet).not.toBeInTheDocument()
  })

  it('puts the same actions in a menu on the desktop, the destructive one in danger', async () => {
    await page.viewport(1440, 900)
    const { onDelete } = renderActions()
    await page.getByRole('button', { name: 'Feira, subcategoria de Mercado: ações' }).click()
    const items = page.getByRole('menuitem')

    await expect.element(items.first()).toHaveTextContent('Editar')
    expect((await items.elements()).map((item) => item.textContent)).toEqual([
      'Editar',
      'Arquivar',
      'Excluir',
    ])
    await page.getByRole('menuitem', { name: 'Excluir' }).click()
    expect(onDelete).toHaveBeenCalledOnce()
  })

  it('renders nothing when the person may do nothing with the item', async () => {
    const screen = await render(<ItemActions title="Feira" triggerLabel="Ações" actions={[]} />)
    expect(screen.container.querySelector('button')).toBeNull()
  })
})
