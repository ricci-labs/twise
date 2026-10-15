import { SearchInput } from '@web/components/inputs/search-input/search-input'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { page, userEvent } from 'vitest/browser'
import { render } from 'vitest-browser-react'

function Search({ initial = '' }: { initial?: string }) {
  const [value, setValue] = useState(initial)
  return <SearchInput label="Buscar categoria" value={value} onValueChange={setValue} />
}

describe('SearchInput', () => {
  it('is named by its label, which is also the placeholder', async () => {
    const screen = await render(<Search />)
    const search = screen.getByRole('searchbox', { name: 'Buscar categoria' })

    await expect.element(search).toHaveAttribute('placeholder', 'Buscar categoria')
    await expect
      .element(screen.getByRole('button', { name: 'Limpar busca' }))
      .not.toBeInTheDocument()
    await expectNoAccessibilityViolations(screen.container)
  })

  it('clears with the "×" and keeps the focus in the field', async () => {
    const screen = await render(<Search />)
    const search = screen.getByRole('searchbox', { name: 'Buscar categoria' })

    await search.fill('Mercado')
    await screen.getByRole('button', { name: 'Limpar busca' }).click()
    await expect.element(search).toHaveValue('')
    await expect.element(search).toHaveFocus()
    await expect
      .element(screen.getByRole('button', { name: 'Limpar busca' }))
      .not.toBeInTheDocument()
  })

  it('clears with Escape without closing what holds it, and lets Escape through once empty', async () => {
    const onParentKeyDown = vi.fn()
    const screen = await render(
      <div role="dialog" aria-label="Escolher categoria" onKeyDown={onParentKeyDown}>
        <Search initial="Feira" />
      </div>,
    )
    const search = screen.getByRole('searchbox', { name: 'Buscar categoria' })

    await search.click()
    await userEvent.keyboard('{Escape}')
    await expect.element(search).toHaveValue('')
    expect(onParentKeyDown).not.toHaveBeenCalled()
    await userEvent.keyboard('{Escape}')
    expect(onParentKeyDown).toHaveBeenCalledOnce()
    await expect.element(page.getByRole('button', { name: 'Limpar busca' })).not.toBeInTheDocument()
    await expectNoAccessibilityViolations(screen.container)
  })
})
