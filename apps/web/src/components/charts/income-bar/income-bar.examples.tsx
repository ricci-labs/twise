import { IncomeBar } from '@web/components/charts/income-bar/income-bar'
import type { ComponentExamples } from '@web/lib/examples.types'

export const incomeBarExamples: ComponentExamples = {
  component: 'IncomeBar',
  examples: [
    {
      name: 'Para onde vai a renda',
      render: () => (
        <IncomeBar
          className="w-90"
          segments={[
            {
              key: 'spent',
              tone: 'spent',
              label: 'Gasto',
              percent: 43,
              percentLabel: '43%',
              amountLabel: 'R$ 3.860,00',
            },
            {
              key: 'committed',
              tone: 'committed',
              label: 'Comprometido',
              percent: 31,
              percentLabel: '31%',
              amountLabel: 'R$ 2.800,00',
            },
            {
              key: 'free',
              tone: 'free',
              label: 'Livre',
              percent: 26,
              percentLabel: '26%',
              amountLabel: 'R$ 2.340,00',
            },
          ]}
        />
      ),
    },
  ],
}
