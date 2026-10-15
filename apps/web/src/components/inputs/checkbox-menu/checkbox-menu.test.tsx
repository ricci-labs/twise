import { CheckboxMenu } from '@web/components/inputs/checkbox-menu/checkbox-menu'
import { FilterButton } from '@web/components/inputs/filter-button'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'
import { render } from 'vitest-browser-react'

const OPTIONS = [
  { value: 'expense', label: 'Despesa' },
  { value: 'card_purchase', label: 'Compra no cartão' },
  { value: 'income', label: 'Receita' },
]

function renderMenu(value: string[], onChange = vi.fn()) {
  return render(
    <CheckboxMenu
      label="Tipo"
      trigger={<FilterButton label="Tipo" />}
      options={OPTIONS}
      value={value}
      onChange={onChange}
    />,
  )
}

describe('CheckboxMenu', () => {
  it('marks one more option and stays open, in the order of the options', async () => {
    const onChange = vi.fn()
    const screen = await renderMenu(['income'], onChange)

    await screen.getByRole('button', { name: 'Tipo' }).click()
    const menu = page.getByRole('menu')
    await expect.element(menu.getByRole('menuitemcheckbox', { name: 'Receita' })).toBeChecked()
    await menu.getByRole('menuitemcheckbox', { name: 'Despesa' }).click()

    expect(onChange).toHaveBeenCalledWith(['expense', 'income'])
    await expect.element(menu).toBeVisible()
    await expectNoAccessibilityViolations(menu.element())
  })

  it('unmarks an option and clears them all', async () => {
    const onChange = vi.fn()
    const screen = await renderMenu(['expense', 'income'], onChange)

    await screen.getByRole('button', { name: 'Tipo' }).click()
    await page.getByRole('menuitemcheckbox', { name: 'Receita' }).click()
    expect(onChange).toHaveBeenLastCalledWith(['expense'])
    await page.getByRole('menuitem', { name: 'Limpar' }).click()
    expect(onChange).toHaveBeenLastCalledWith([])
  })
})
