import { AuditChange } from '@web/components/display/audit-change/audit-change'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'

const ROWS = [
  { label: 'Valor', before: 'R$ 18,50', after: 'R$ 21,00', isChanged: true },
  { label: 'Descrição', before: 'Padaria', after: 'Padaria', isChanged: false },
]

describe('AuditChange', () => {
  it('shows who and when, then before and after with the changed field marked', async () => {
    const screen = await render(
      <AuditChange
        actorName="Member B"
        title="Member B editou o lançamento Padaria"
        detail="Hoje, 11:05 · Pela web"
        rows={ROWS}
        reference="a91b2f07"
      />,
    )

    await expect.element(screen.getByText('Member B editou o lançamento Padaria')).toBeVisible()
    await expect.element(screen.getByRole('columnheader', { name: 'Antes' })).toBeVisible()
    const changed = screen.getByRole('row', { name: /Valor/ })
    await expect.element(changed).toHaveAttribute('data-changed')
    await expect.element(screen.getByRole('rowheader', { name: 'Valor (mudou)' })).toBeVisible()
    await expect
      .element(screen.getByRole('row', { name: /Descrição/ }))
      .not.toHaveAttribute('data-changed')
    await expect
      .element(screen.getByText(/O campo que mudou fica marcado\. Referência/))
      .toBeVisible()
    await expect.element(screen.getByText('a91b2f07')).toBeVisible()
    await expectNoAccessibilityViolations(screen.container)
  })

  it('leaves out the table and the note when there is nothing to show', async () => {
    const screen = await render(
      <AuditChange
        actorName={null}
        title="Automático excluiu a conta Carteira"
        detail="Hoje, 06:00"
        rows={[]}
        reference={null}
      />,
    )

    await expect.element(screen.getByText('Automático excluiu a conta Carteira')).toBeVisible()
    expect(screen.container.querySelector('table')).toBeNull()
    expect(screen.container.querySelector('p')).toBeNull()
  })
})
