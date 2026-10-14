import { ItemActions } from '@web/components/actions/item-actions/item-actions'
import type { ItemAction } from '@web/components/actions/item-actions/item-actions.types'
import type { ComponentExamples } from '@web/lib/examples.types'

const ACCOUNT_ACTIONS: readonly ItemAction[] = [
  { key: 'entries', label: 'Ver lançamentos', icon: 'list' },
  { key: 'edit', label: 'Editar', icon: 'edit' },
  { key: 'opening', label: 'Informar saldo inicial', icon: 'flag' },
  { key: 'archive', label: 'Arquivar', icon: 'archive' },
  { key: 'delete', label: 'Excluir', icon: 'trash', tone: 'danger' },
]

const SUBCATEGORY_ACTIONS: readonly ItemAction[] = [
  { key: 'entries', label: 'Ver lançamentos', icon: 'list' },
  { key: 'edit', label: 'Editar', icon: 'edit' },
  { key: 'move', label: 'Mover para outra categoria', icon: 'move' },
  { key: 'archive', label: 'Arquivar', icon: 'archive' },
  { key: 'delete', label: 'Excluir', icon: 'trash', tone: 'danger' },
]

export const itemActionsExamples: ComponentExamples = {
  component: 'ItemActions',
  examples: [
    {
      name: 'Ações de uma conta (folha no celular, menu no desktop)',
      render: () => (
        <ItemActions title="Conta Y" triggerLabel="Ações de Conta Y" actions={ACCOUNT_ACTIONS} />
      ),
    },
    {
      name: 'Ações de uma subcategoria',
      render: () => (
        <ItemActions
          title="Feira"
          description="Subcategoria de Mercado"
          triggerLabel="Feira, subcategoria de Mercado: ações"
          actions={SUBCATEGORY_ACTIONS}
        />
      ),
    },
  ],
}
