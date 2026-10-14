import { EmptyState } from '@web/components/feedback/empty-state/empty-state'
import type { ComponentExamples } from '@web/lib/examples.types'

export const emptyStateExamples: ComponentExamples = {
  component: 'EmptyState',
  examples: [
    {
      name: 'Com ação',
      render: () => (
        <EmptyState art="piggy-bank" action={<a href="#exemplo">Definir orçamentos</a>}>
          Defina orçamentos para acompanhar o ritmo dos gastos.
        </EmptyState>
      ),
    },
  ],
}
