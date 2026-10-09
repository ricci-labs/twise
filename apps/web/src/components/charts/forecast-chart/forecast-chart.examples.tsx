import { ForecastChart } from '@web/components/charts/forecast-chart/forecast-chart'
import type { ForecastPoint } from '@web/components/charts/forecast-chart/forecast-chart.types'
import type { ComponentExamples } from '@web/lib/examples.types'

const POINTS: readonly ForecastPoint[] = [
  { key: '2026-10-20', label: '20 out', cents: 408_000 },
  { key: '2026-10-22', label: '22 out', cents: 384_000 },
  { key: '2026-10-25', label: '25 out', cents: 336_000 },
  { key: '2026-10-26', label: '26 out', cents: 326_000 },
  { key: '2026-11-01', label: '1 nov', cents: 236_000 },
  { key: '2026-11-04', label: '4 nov', cents: 41_000 },
  { key: '2026-11-05', label: '5 nov', cents: 391_000 },
]

const NEGATIVE: readonly ForecastPoint[] = POINTS.map((point) => ({
  ...point,
  cents: point.cents - 120_000,
}))

const axis = (cents: number) => `R$ ${Math.round(cents / 100_000)} mil`

export const forecastChartExamples: ComponentExamples = {
  component: 'ForecastChart',
  examples: [
    {
      name: 'Sempre positivo',
      render: () => (
        <ForecastChart
          points={POINTS}
          lowestKey="2026-11-04"
          lowestLabel="R$ 410,00 · 4 nov · menor saldo do período"
          description="Conta X: hoje R$ 4.080,00, termina em R$ 3.910,00, menor saldo R$ 410,00 em 4 nov."
          formatAxis={axis}
        />
      ),
    },
    {
      name: 'Fica negativo',
      render: () => (
        <ForecastChart
          points={NEGATIVE}
          lowestKey="2026-11-04"
          lowestLabel="−R$ 790,00 · 4 nov · menor saldo do período"
          description="Conta X: fica negativa em 4 nov."
          formatAxis={axis}
        />
      ),
    },
  ],
}
