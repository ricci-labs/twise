import { Amount } from '@web/components/display/amount'
import { ListSection } from '@web/components/display/list-section/list-section'
import { OccurrenceGroup } from '@web/components/finance/occurrence-group'
import { OpenItemRow } from '@web/components/finance/open-item-row'
import type { ComponentExamples } from '@web/lib/examples.types'

export const listSectionExamples: ComponentExamples = {
  component: 'ListSection',
  examples: [
    {
      name: 'Em aberto, com o total ao lado e os grupos dentro',
      render: () => (
        <div className="w-full max-w-100">
          <ListSection title="Em aberto" aside={<Amount cents={52000} size="inherit" />}>
            <OccurrenceGroup title="Vencidos" heading="label">
              <OpenItemRow
                dueOn="2026-10-10"
                description="Mercado da semana"
                detail="Cartão X"
                amountCents={12000}
                isOverdue
              />
            </OccurrenceGroup>
          </ListSection>
        </div>
      ),
    },
    {
      name: 'Nada para listar',
      render: () => (
        <div className="w-full max-w-100">
          <ListSection
            title="Em aberto"
            empty="Nada em aberto. Os R$ 30,00 abatem as próximas compras divididas com Member F."
          />
        </div>
      ),
    },
  ],
}
