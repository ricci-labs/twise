import { OccurrenceGroup } from '@web/components/finance/occurrence-group'
import { OpenItemRow } from '@web/components/finance/open-item-row/open-item-row'
import type { ComponentExamples } from '@web/lib/examples.types'

export const openItemRowExamples: ComponentExamples = {
  component: 'OpenItemRow',
  examples: [
    {
      name: 'Vencidos e A vencer',
      render: () => (
        <div className="flex w-full max-w-100 flex-col gap-1.5">
          <OccurrenceGroup title="Vencidos" heading="label">
            <OpenItemRow
              dueOn="2026-10-10"
              description="Mercado da semana"
              detail="Cartão X · metade de R$ 240,00"
              amountCents={12000}
              isOverdue
            />
            <OpenItemRow
              dueOn="2026-10-10"
              description="Jantar de aniversário"
              detail="Cartão X · 1 de 3 partes"
              amountCents={8000}
              isOverdue
            />
          </OccurrenceGroup>
          <OccurrenceGroup title="A vencer" heading="label">
            <OpenItemRow
              dueOn="2026-11-10"
              description="TV da sala (parcela 2/3)"
              detail="Cartão X"
              amountCents={16000}
            />
          </OccurrenceGroup>
        </div>
      ),
    },
    {
      name: 'Já numa cobrança',
      render: () => (
        <div className="w-full max-w-100">
          <OccurrenceGroup title="Vencidos" heading="label">
            <OpenItemRow
              dueOn="2026-10-10"
              description="Mercado da semana"
              detail="Cartão X · metade de R$ 240,00"
              amountCents={12000}
              isOverdue
              chargedOn="2026-10-20"
            />
          </OccurrenceGroup>
        </div>
      ),
    },
    {
      name: 'Texto longo e valor de 7 dígitos',
      render: () => (
        <div className="w-full max-w-100">
          <OccurrenceGroup title="Vencidos" heading="label">
            <OpenItemRow
              dueOn="2026-10-10"
              description="Reforma da cozinha e do banheiro da casa da praia com Maria Aparecida dos Santos Oliveira"
              detail="Cartão Conjunto do Banco Exemplo · metade de R$ 2.513.040,00"
              amountCents={125652000}
              isOverdue
              chargedOn="2026-10-20"
            />
          </OccurrenceGroup>
        </div>
      ),
    },
  ],
}
