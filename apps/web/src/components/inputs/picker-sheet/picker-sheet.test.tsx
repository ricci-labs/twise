import { PickerSheet } from '@web/components/inputs/picker-sheet/picker-sheet'
import type { PickerSheetProps } from '@web/components/inputs/picker-sheet/picker-sheet.types'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'
import { render } from 'vitest-browser-react'

const CATEGORIES = [
  {
    value: 'groceries',
    label: 'Mercado',
    icon: 'groceries',
    children: [
      { value: 'fair', label: 'Feira' },
      { value: 'bakery', label: 'Padaria' },
    ],
  },
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
        value="health"
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
      .element(page.getByRole('button', { name: 'Saúde' }))
      .toHaveAttribute('aria-current', 'true')
    await page.getByRole('button', { name: 'Transporte' }).click()
    expect(onSelect).toHaveBeenCalledWith('transport')
    expect(onOpenChange).toHaveBeenCalledWith(false)
    await expectNoAccessibilityViolations(document.body)
  })

  it('opens the subcategories of a parent below the grid, with the parent itself first', async () => {
    const { onSelect, onOpenChange } = renderSheet({ layout: 'grid' })

    await page.getByRole('button', { name: /Mercado/ }).click()
    expect(onSelect).not.toHaveBeenCalled()
    await expect.element(page.getByText('2 sub')).toBeVisible()
    await expect.element(page.getByRole('radiogroup', { name: 'Em Mercado' })).toBeVisible()
    await page.getByRole('radio', { name: 'Feira' }).click()
    expect(onSelect).toHaveBeenCalledWith('fair')
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('lets the parent be chosen on its own', async () => {
    const { onSelect } = renderSheet({ layout: 'grid', value: 'bakery' })

    await expect.element(page.getByRole('radio', { name: 'Padaria' })).toBeChecked()
    await page.getByRole('radio', { name: 'Só Mercado' }).click()
    expect(onSelect).toHaveBeenCalledWith('groceries')
    await expectNoAccessibilityViolations(document.body)
  })

  it('finds subcategories in the search, with their parent', async () => {
    const { onSelect } = renderSheet({ layout: 'grid', searchLabel: 'Buscar categoria' })

    await page.getByRole('searchbox', { name: 'Buscar categoria' }).fill('feira')
    await expect.element(page.getByText('em Mercado')).toBeVisible()
    await page.getByRole('button', { name: /Feira/ }).click()
    expect(onSelect).toHaveBeenCalledWith('fair')
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
