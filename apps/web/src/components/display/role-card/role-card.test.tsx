import { RoleCard } from '@web/components/display/role-card/role-card'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'

describe('RoleCard', () => {
  it('says the role type, who uses it and what it can do, with the owner locked', async () => {
    const screen = await render(
      <ul>
        <RoleCard
          name="Dono"
          description="Tudo, inclusive membros, papéis e configurações."
          isSystem
          isLocked
          memberCount={1}
          invitationCount={0}
        />
        <RoleCard
          name="Contador"
          description="Vê tudo e anexa comprovantes."
          isSystem={false}
          memberCount={2}
          invitationCount={1}
          actions={<button type="button">Ações de Contador</button>}
        />
        <RoleCard name="Leitor" description="" isSystem memberCount={0} invitationCount={0} />
      </ul>,
    )
    const rows = screen.getByRole('listitem')
    const owner = rows.nth(0)
    const accountant = rows.nth(1)
    const reader = rows.nth(2)

    await expect.element(owner.getByText('Sistema')).toBeVisible()
    await expect.element(owner.getByText('1 pessoa')).toBeVisible()
    await expect.element(owner.getByText('Não pode ser alterado')).toBeVisible()
    await expect.element(accountant.getByText('Do espaço')).toBeVisible()
    await expect.element(accountant.getByText('2 pessoas · 1 convite')).toBeVisible()
    expect(accountant.getByText('Não pode ser alterado').query()).toBeNull()
    await expect.element(reader.getByText('Ninguém')).toBeVisible()
    await expectNoAccessibilityViolations(screen.container)
  })
})
