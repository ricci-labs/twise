import { CommittedChart } from '@web/components/charts/committed-chart/committed-chart'
import type { ComponentExamples } from '@web/lib/examples.types'

const MONTHS = [
  {
    key: '2026-11',
    label: 'nov/26',
    installmentsPercent: 9,
    plannedPercent: 43,
    percentLabel: '52%',
    isHigh: false,
  },
  {
    key: '2026-12',
    label: 'dez/26',
    installmentsPercent: 9,
    plannedPercent: 43,
    percentLabel: '52%',
    isHigh: false,
  },
  {
    key: '2027-01',
    label: 'jan/27',
    installmentsPercent: 9,
    plannedPercent: 63,
    percentLabel: '72%',
    isHigh: true,
  },
  {
    key: '2027-02',
    label: 'fev/27',
    installmentsPercent: 0,
    plannedPercent: 43,
    percentLabel: '43%',
    isHigh: false,
  },
]

export const committedChartExamples: ComponentExamples = {
  component: 'CommittedChart',
  examples: [
    {
      name: 'Próximos meses',
      render: () => (
        <CommittedChart
          months={MONTHS}
          limitPercent={70}
          limitLabel="70% da renda fixa"
          installmentsLabel="Parcelas"
          plannedLabel="Contas previstas"
          description="Janeiro já tem 72% da renda fixa comprometida."
        />
      ),
    },
  ],
}
