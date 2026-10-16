import { ItemActions } from '@web/components/actions/item-actions'
import { HolidayRow } from '@web/components/finance/holiday-row/holiday-row'
import type { ComponentExamples } from '@web/lib/examples.types'
import type { ReactNode } from 'react'

function Card({ children }: { children: ReactNode }) {
  return (
    <ul className="w-full max-w-100 rounded-xl border border-border bg-surface px-3">{children}</ul>
  )
}

function noop() {}

export const holidayRowExamples: ComponentExamples = {
  component: 'HolidayRow',
  examples: [
    {
      name: 'Passado, o próximo e um que cai no fim de semana',
      render: () => (
        <Card>
          <HolidayRow onDate="2026-10-12" name="Nossa Senhora Aparecida" status="past" />
          <HolidayRow onDate="2026-11-02" name="Finados" status="next" />
          <HolidayRow onDate="2026-11-15" name="Proclamação da República" status="upcoming" />
        </Card>
      ),
    },
    {
      name: 'Do espaço, com "⋯" e nome longo',
      render: () => (
        <Card>
          <HolidayRow
            onDate="2026-12-08"
            name="Aniversário da cidade e padroeira municipal com feriado prolongado"
            status="upcoming"
            actions={
              <ItemActions
                title="Aniversário da cidade"
                triggerLabel="Ações de Aniversário da cidade"
                actions={[
                  {
                    key: 'remove',
                    label: 'Excluir',
                    icon: 'trash',
                    tone: 'danger',
                    onSelect: noop,
                  },
                ]}
              />
            }
          />
        </Card>
      ),
    },
  ],
}
