import { Button } from '@web/components/actions/button'
import { EmptyBlock } from '@web/components/feedback/empty-block/empty-block'
import type { ComponentExamples } from '@web/lib/examples.types'
import { Plus } from 'lucide-react'

export const emptyBlockExamples: ComponentExamples = {
  component: 'EmptyBlock',
  examples: [
    {
      name: 'Lista vazia, com a primeira ação',
      render: () => (
        <EmptyBlock
          icon="wallet"
          title="Nenhuma conta ainda."
          text="Comece pela sua conta corrente. Depois, os cartões."
          action={
            <Button>
              <Plus aria-hidden="true" />
              Nova conta
            </Button>
          }
        />
      ),
    },
    {
      name: 'Para quem só vê',
      render: () => (
        <EmptyBlock icon="trash" title="A lixeira está vazia." text="Nada foi excluído." />
      ),
    },
  ],
}
