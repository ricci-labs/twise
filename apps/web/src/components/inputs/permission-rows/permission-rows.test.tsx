import type { Permission } from '@financas/shared'
import { PermissionRows, toggled } from '@web/components/inputs/permission-rows/permission-rows'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'
import { render } from 'vitest-browser-react'

const AREAS = [
  { module: 'entries', label: 'Lançamentos' },
  { module: 'settings', label: 'Configurações' },
  { module: 'members', label: 'Membros' },
] as const

const ALLOWED: readonly Permission[] = [
  { module: 'entries', action: 'view' },
  { module: 'entries', action: 'create' },
  { module: 'entries', action: 'update' },
  { module: 'entries', action: 'delete' },
  { module: 'settings', action: 'view' },
  { module: 'settings', action: 'update' },
  { module: 'members', action: 'view' },
]

function area(name: string) {
  return page.getByRole('group', { name, exact: true })
}

describe('PermissionRows', () => {
  it('shows only the actions an area has, each in its column, and locks what the editor lacks', async () => {
    const screen = await render(
      <PermissionRows
        label="Permissões"
        areas={AREAS}
        value={[{ module: 'entries', action: 'view' }]}
        allowed={ALLOWED}
        onChange={vi.fn()}
      />,
    )

    await expect
      .element(area('Lançamentos').getByRole('button', { name: 'Ver' }))
      .toHaveAttribute('aria-pressed', 'true')
    expect(area('Configurações').getByRole('button', { name: 'Criar' }).query()).toBeNull()
    const settingsView = area('Configurações').getByRole('button', { name: 'Ver' }).element()
    const settingsEdit = area('Configurações').getByRole('button', { name: 'Editar' }).element()
    const entriesEdit = area('Lançamentos').getByRole('button', { name: 'Editar' }).element()
    expect(settingsEdit.getBoundingClientRect().left).toBe(entriesEdit.getBoundingClientRect().left)
    expect(settingsView.getBoundingClientRect().left).toBeLessThan(
      settingsEdit.getBoundingClientRect().left,
    )
    const locked = area('Membros').getByRole('button', { name: 'Excluir' })
    await expect.element(locked).toBeDisabled()
    await expect.element(locked).toHaveAttribute('title', 'Você não tem essa permissão para dar.')
    await expectNoAccessibilityViolations(screen.container)
  })

  it('ticks "Ver" with any action and clears the area when "Ver" is unticked', async () => {
    const onChange = vi.fn()
    await render(
      <PermissionRows
        label="Permissões"
        areas={AREAS}
        value={[]}
        allowed={ALLOWED}
        onChange={onChange}
      />,
    )
    await area('Lançamentos').getByRole('button', { name: 'Editar' }).click()
    expect(onChange).toHaveBeenLastCalledWith([
      { module: 'entries', action: 'view' },
      { module: 'entries', action: 'update' },
    ])

    const full: Permission[] = [
      { module: 'entries', action: 'view' },
      { module: 'entries', action: 'create' },
      { module: 'settings', action: 'view' },
    ]
    expect(toggled(full, 'entries', 'view', false)).toEqual([
      { module: 'settings', action: 'view' },
    ])
    expect(toggled(full, 'entries', 'create', false)).toEqual([
      { module: 'settings', action: 'view' },
      { module: 'entries', action: 'view' },
    ])
  })
})
