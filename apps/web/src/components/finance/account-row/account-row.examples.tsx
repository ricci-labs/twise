import { ItemActions } from '@web/components/actions/item-actions'
import { AccountRow } from '@web/components/finance/account-row/account-row'
import type { ComponentExamples } from '@web/lib/examples.types'
import { ACCOUNT_COLORS } from '@web/styles/account-colors'

const LIST = 'rounded-lg border border-border bg-surface px-3 py-1'

function actionsOf(name: string) {
  return (
    <ItemActions
      title={name}
      triggerLabel={`Ações de ${name}`}
      actions={[
        { key: 'edit', label: 'Editar', icon: 'edit' },
        { key: 'delete', label: 'Excluir', icon: 'trash', tone: 'danger' },
      ]}
    />
  )
}

export const accountRowExamples: ComponentExamples = {
  component: 'AccountRow',
  examples: [
    {
      name: 'Contas de dinheiro',
      render: () => (
        <ul className={LIST}>
          <AccountRow
            name="Conta X"
            icon="wallet"
            color={ACCOUNT_COLORS[0].value}
            detail="Conta corrente · Member A"
            amountCents={420000}
            actions={actionsOf('Conta X')}
          />
          <AccountRow
            name="Poupança"
            icon="piggy-bank"
            color={ACCOUNT_COLORS[2].value}
            detail="Poupança · da casa"
            amountCents={1200000}
            actions={actionsOf('Poupança')}
          />
        </ul>
      ),
    },
    {
      name: 'Recém-criada e arquivada',
      render: () => (
        <ul className={LIST}>
          <AccountRow
            name="Conta Z"
            icon="wallet"
            color={null}
            detail="Conta corrente · Member A"
            amountCents={0}
            isHighlighted
          />
          <AccountRow
            name="Conta antiga"
            icon="wallet"
            color={null}
            detail="Conta corrente · da casa"
            amountCents={0}
            isArchived
          />
        </ul>
      ),
    },
    {
      name: 'Texto longo no celular',
      render: () => (
        <ul className="w-80 rounded-lg border border-border bg-surface px-3 py-1">
          <AccountRow
            name="Conta Conjunta do Banco Exemplo"
            icon="wallet"
            color={ACCOUNT_COLORS[0].value}
            detail="Conta corrente · Fulana de Tal dos Santos Silva"
            amountCents={123456789}
            actions={actionsOf('Conta Conjunta do Banco Exemplo')}
          />
        </ul>
      ),
    },
  ],
}
