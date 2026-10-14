import { AccountGroup } from '@web/components/finance/account-group/account-group'
import { AccountRow } from '@web/components/finance/account-row'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'

describe('AccountGroup', () => {
  it('names its list, offers the add link and keeps the note under it', async () => {
    const onPress = vi.fn()
    const screen = await render(
      <AccountGroup
        title="Cartões"
        add={{ label: 'Novo cartão', onPress }}
        note="Nos cartões, o total em aberto inclui as parcelas futuras."
      >
        <AccountRow name="Cartão X" icon="card" color={null} detail="Em aberto" amountCents={0} />
      </AccountGroup>,
    )
    const group = screen.getByRole('region', { name: 'Cartões' })

    await expect.element(group.getByRole('listitem')).toBeVisible()
    await group.getByRole('button', { name: 'Novo cartão' }).click()
    expect(onPress).toHaveBeenCalledOnce()
    await expect
      .element(group.getByText('Nos cartões, o total em aberto inclui as parcelas futuras.'))
      .toBeVisible()
    await expectNoAccessibilityViolations(screen.container)
  })

  it('has no add link for someone who only views', async () => {
    const screen = await render(
      <AccountGroup title="Dinheiro">
        <AccountRow name="Conta X" icon="wallet" color={null} detail="Conta corrente" />
      </AccountGroup>,
    )
    expect(screen.container.querySelector('button, a')).toBeNull()
  })
})
