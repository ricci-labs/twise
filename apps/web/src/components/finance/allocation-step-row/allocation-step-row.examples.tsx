import { ItemActions } from '@web/components/actions/item-actions'
import { AllocationStepRow } from '@web/components/finance/allocation-step-row/allocation-step-row'
import type { ComponentExamples } from '@web/lib/examples.types'
import type { ReactNode } from 'react'

function Steps({ children }: { children: ReactNode }) {
  return <ol className="flex w-full max-w-100 flex-col gap-2">{children}</ol>
}

function noop() {}

function actionsOf(title: string) {
  return (
    <ItemActions
      title={title}
      triggerLabel={`Ações de ${title}`}
      actions={[
        { key: 'up', label: 'Mover para cima', icon: 'move', onSelect: noop },
        { key: 'edit', label: 'Editar', icon: 'edit', onSelect: noop },
        { key: 'remove', label: 'Remover passo', icon: 'trash', tone: 'danger', onSelect: noop },
      ]}
    />
  )
}

export const allocationStepRowExamples: ComponentExamples = {
  component: 'AllocationStepRow',
  examples: [
    {
      name: 'Passos com alça e ⋯',
      render: () => (
        <Steps>
          <AllocationStepRow
            position={1}
            title="R$ 600,00 para a Poupança"
            detail="Valor fixo · a reserva de emergência"
            art={{ name: 'Poupança', icon: 'piggy-bank' }}
            actions={actionsOf('R$ 600,00 para a Poupança')}
          />
          <AllocationStepRow
            position={2}
            title="Cobrir o que passou do orçamento"
            detail="Neste período: Lazer passou R$ 60,00"
            art={{ name: 'Orçamento', icon: 'calendar' }}
            actions={actionsOf('Cobrir o que passou do orçamento')}
          />
          <AllocationStepRow
            position={3}
            title="O que sobrar para a Conta X"
            detail="Sempre o último passo"
            art={{ name: 'Conta X', icon: 'wallet' }}
            actions={actionsOf('O que sobrar para a Conta X')}
          />
        </Steps>
      ),
    },
    {
      name: 'Levantado (arrastando)',
      render: () => (
        <Steps>
          <AllocationStepRow
            position={3}
            title="20% para a Conta Viagem"
            detail="Porcentagem da comissão inteira · meta Viagem"
            art={{ name: 'Conta Viagem', icon: 'travel' }}
            isLifted
            actions={actionsOf('20% para a Conta Viagem')}
          />
        </Steps>
      ),
    },
    {
      name: 'Meta excluída',
      render: () => (
        <Steps>
          <AllocationStepRow
            position={2}
            title="Completar a meta Troca do carro"
            detail="Completar uma meta"
            art={{ name: 'Troca do carro', icon: 'transport' }}
            isInvalid
            actions={actionsOf('Completar a meta Troca do carro')}
          />
        </Steps>
      ),
    },
    {
      name: 'Leitor (sem alça e sem ⋯)',
      render: () => (
        <Steps>
          <AllocationStepRow
            position={1}
            title="R$ 600,00 para a Poupança"
            detail="Valor fixo · a reserva de emergência"
            art={{ name: 'Poupança', icon: 'piggy-bank' }}
            isReadOnly
          />
        </Steps>
      ),
    },
    {
      name: 'Texto longo',
      render: () => (
        <Steps>
          <AllocationStepRow
            position={4}
            title="R$ 1.256.200,00 para o Investimento para a troca do carro da família em 2027"
            detail="Valor fixo · meta Investimento para a troca do carro da família em 2027, guardado na Conta Conjunta do Banco Exemplo"
            art={{ name: 'Investimento', icon: 'transport' }}
            actions={actionsOf('Investimento para a troca do carro da família em 2027')}
          />
          <AllocationStepRow
            position={5}
            title="Completar a meta Investimento para a troca do carro da família em 2027"
            detail="Completar uma meta"
            art={{ name: 'Investimento', icon: 'transport' }}
            isInvalid
            actions={actionsOf('Investimento para a troca do carro da família em 2027')}
          />
        </Steps>
      ),
    },
  ],
}
