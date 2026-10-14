import { AccountGroup } from '@web/components/finance/account-group/account-group'
import { AccountRow } from '@web/components/finance/account-row'
import type { ComponentExamples } from '@web/lib/examples.types'
import { ACCOUNT_COLORS } from '@web/styles/account-colors'

export const accountGroupExamples: ComponentExamples = {
  component: 'AccountGroup',
  examples: [
    {
      name: 'Cartões, com o link de criar e a nota',
      render: () => (
        <AccountGroup
          title="Cartões"
          add={{ label: 'Novo cartão', onPress: () => undefined }}
          note="Nos cartões, o total em aberto inclui as parcelas futuras."
        >
          <AccountRow
            name="Cartão X"
            icon="card"
            color={ACCOUNT_COLORS[7].value}
            detail="Em aberto · fecha 25/10 · vence 04/11"
            amountCents={289000}
          />
          <AccountRow
            name="Cartão Y"
            icon="card"
            color={ACCOUNT_COLORS[4].value}
            detail="Em aberto · fecha 02/11 · vence 10/11"
            amountCents={62000}
          />
        </AccountGroup>
      ),
    },
    {
      name: 'Para quem só vê',
      render: () => (
        <AccountGroup title="Dinheiro">
          <AccountRow
            name="Conta X"
            icon="wallet"
            color={ACCOUNT_COLORS[0].value}
            detail="Conta corrente · Member A"
            amountCents={420000}
          />
        </AccountGroup>
      ),
    },
  ],
}
