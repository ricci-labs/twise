import { NextDatesPreview } from '@web/components/finance/next-dates-preview/next-dates-preview'
import type { ComponentExamples } from '@web/lib/examples.types'

export const nextDatesPreviewExamples: ComponentExamples = {
  component: 'NextDatesPreview',
  examples: [
    {
      name: 'Dia ajustado pelo fim de semana',
      render: () => (
        <div className="w-full max-w-100">
          <NextDatesPreview
            dates={[
              { key: '1', date: '10/11', weekday: 'ter', amountCents: 9990 },
              { key: '2', date: '10/12', weekday: 'qui', amountCents: 9990 },
              {
                key: '3',
                date: '11/01',
                weekday: 'seg',
                amountCents: 9990,
                note: 'dia 10 é domingo, foi para segunda',
              },
            ]}
          />
        </div>
      ),
    },
    {
      name: 'Dia útil, valor aproximado',
      render: () => (
        <div className="w-full max-w-100">
          <NextDatesPreview
            dates={[
              {
                key: '1',
                date: '03/11',
                weekday: 'ter',
                amountCents: 80000,
                isEstimate: true,
                note: '1º dia útil',
              },
              {
                key: '2',
                date: '04/01',
                weekday: 'seg',
                amountCents: 80000,
                isEstimate: true,
                note: '1º dia útil, depois do feriado',
              },
            ]}
          />
        </div>
      ),
    },
  ],
}
