import { PickerSheet } from '@web/components/inputs/picker-sheet/picker-sheet'
import type { PickerSheetProps } from '@web/components/inputs/picker-sheet/picker-sheet.types'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'
import { render } from 'vitest-browser-react'

const CATEGORIES = [
  { value: 'groceries', label: 'Mercado', icon: 'groceries' },
  { value: 'health', label: 'Saúde', icon: 'health' },
  { value: 'transport', label: 'Transporte', icon: 'transport' },
]

function renderSheet(props: Partial<PickerSheetProps> = {}) {
  const onSelect = vi.fn()
  const onOpenChange = vi.fn()
  return {
    onSelect,
    onOpenChange,
    screen: render(
      <PickerSheet
        title="Categoria"
        items={CATEGORIES}
        value="groceries"
        isOpen
        onOpenChange={onOpenChange}
        onSelect={onSelect}
        {...props}
      />,
    ),
  }
}

describe('PickerSheet', () => {
  it('opens as a titled dialog, marks the current choice, and closes on a pick', async () => {
    const { onSelect, onOpenChange } = renderSheet()

    await expect.element(page.getByRole('dialog', { name: 'Categoria' })).toBeVisible()
    await expect
      .element(page.getByRole('button', { name: 'Mercado' }))
      .toHaveAttribute('aria-current', 'true')
    await page.getByRole('button', { name: 'Saúde' }).click()
    expect(onSelect).toHaveBeenCalledWith('health')
    expect(onOpenChange).toHaveBeenCalledWith(false)
    await expectNoAccessibilityViolations(document.body)
  })

  it('filters by the search, ignoring case and accents', async () => {
    renderSheet({ layout: 'grid', searchLabel: 'Buscar categoria' })

    await page.getByRole('searchbox', { name: 'Buscar categoria' }).fill('SAUDE')
    await expect.element(page.getByRole('button', { name: 'Saúde' })).toBeVisible()
    await expect.element(page.getByRole('button', { name: 'Mercado' })).not.toBeInTheDocument()
    await page.getByRole('searchbox', { name: 'Buscar categoria' }).fill('xyz')
    await expect.element(page.getByText('Nada encontrado com essa busca.')).toBeVisible()
  })

  it('offers to register the first one when there is nothing to pick', async () => {
    const onAction = vi.fn()
    renderSheet({
      title: 'Cartão',
      items: [],
      empty: {
        icon: 'card',
        title: 'Vocês ainda não têm um cartão.',
        text: 'Cadastre o primeiro para registrar compras no cartão.',
        actionLabel: 'Cadastrar cartão',
        onAction,
      },
    })

    await expect.element(page.getByText('Vocês ainda não têm um cartão.')).toBeVisible()
    await page.getByRole('button', { name: 'Cadastrar cartão' }).click()
    expect(onAction).toHaveBeenCalledOnce()
    await expectNoAccessibilityViolations(document.body)
  })
})
