import { InvitationRow } from '@web/components/display/invitation-row/invitation-row'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'

describe('InvitationRow', () => {
  it('shows the contact, the role, until when it is valid and who invited', async () => {
    const screen = await render(
      <ul>
        <InvitationRow
          channel="email"
          contact="member.c@exemplo.com"
          roleName="Contador"
          isCustomRole
          expiresOn="2026-10-24"
          invitedBy="Member A"
          invitedOn="2026-10-17"
          actions={<button type="button">Ações</button>}
        />
        <InvitationRow
          channel="phone"
          contact="+55 (11) 99999-0005"
          roleName="Leitor"
          isCustomRole={false}
          expiresOn="2026-10-26"
          invitedBy="Member B"
          invitedOn="2026-10-19"
        />
      </ul>,
    )
    const rows = screen.getByRole('listitem')

    await expect.element(rows.nth(0).getByRole('img', { name: 'Convite por e-mail' })).toBeVisible()
    await expect.element(rows.nth(0).getByText('Vale até 24/10')).toBeVisible()
    await expect.element(rows.nth(0).getByText('Convidado por Member A em 17/10')).toBeVisible()
    expect(rows.nth(0).getByText('Link mostrado uma vez').query()).toBeNull()
    await expect
      .element(rows.nth(1).getByRole('img', { name: 'Convite por telefone' }))
      .toBeVisible()
    await expect.element(rows.nth(1).getByText('Link mostrado uma vez')).toBeVisible()
    await expectNoAccessibilityViolations(screen.container)
  })
})
