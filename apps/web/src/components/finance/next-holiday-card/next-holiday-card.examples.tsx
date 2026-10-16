import { NextHolidayCard } from '@web/components/finance/next-holiday-card/next-holiday-card'
import type { ComponentExamples } from '@web/lib/examples.types'

export const nextHolidayCardExamples: ComponentExamples = {
  component: 'NextHolidayCard',
  examples: [
    {
      name: 'Com o que muda nas contas fixas',
      render: () => (
        <div className="w-full max-w-100">
          <NextHolidayCard
            holiday={{
              onDate: '2026-11-02',
              name: 'Finados',
              daysAway: 18,
              effects: [{ description: 'Vale-alimentação', toOn: '2026-11-03' }],
            }}
          />
        </div>
      ),
    },
    {
      name: 'Amanhã, sem mudar nenhuma conta',
      render: () => (
        <div className="w-full max-w-100">
          <NextHolidayCard
            holiday={{
              onDate: '2026-12-08',
              name: 'Aniversário da cidade e padroeira municipal com feriado prolongado',
              daysAway: 1,
              effects: [],
            }}
          />
        </div>
      ),
    },
  ],
}
