import { TrashRow } from '@web/components/finance/trash-row/trash-row'
import type { ComponentExamples } from '@web/lib/examples.types'

export const trashRowExamples: ComponentExamples = {
  component: 'TrashRow',
  examples: [
    {
      name: 'Conta com motivo e categoria sem desenho',
      render: () => (
        <ul className="w-full max-w-90 rounded-lg border border-border bg-surface px-3 py-1">
          <TrashRow
            name="Conta antiga"
            icon="wallet"
            details={['Conta corrente', 'Excluída em 12/10/2026 por Member A']}
            note="Motivo: conta encerrada no banco."
            actionLabel="Restaurar"
            actionAccessibleLabel="Restaurar Conta antiga"
            onAction={() => undefined}
          />
          <TrashRow
            name="Academia"
            icon={null}
            details={[
              'Categoria de despesa · dentro de Saúde',
              'Excluída em 02/10/2026 por Member A',
            ]}
            actionLabel="Restaurar"
            actionAccessibleLabel="Restaurar Academia"
            onAction={() => undefined}
          />
        </ul>
      ),
    },
  ],
}
