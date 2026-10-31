import { ComingMonthsBars } from '@web/components/charts/coming-months-bars/coming-months-bars'
import type { ComponentExamples } from '@web/lib/examples.types'

const BOX = 'w-full max-w-100 rounded-lg border border-border bg-surface p-4'

export const comingMonthsBarsExamples: ComponentExamples = {
  component: 'ComingMonthsBars',
  examples: [
    {
      name: 'Uma compra em 6 vezes',
      render: () => (
        <div className={BOX}>
          <ComingMonthsBars
            referencePercent={70}
            months={[
              { key: 'nov', label: 'nov/26', beforePercent: 58, afterPercent: 64 },
              { key: 'dez', label: 'dez/26', beforePercent: 64, afterPercent: 70 },
              { key: 'jan', label: 'jan/27', beforePercent: 72, afterPercent: 78 },
              { key: 'fev', label: 'fev/27', beforePercent: 41, afterPercent: 47 },
              { key: 'mar', label: 'mar/27', beforePercent: 35, afterPercent: 41 },
              { key: 'abr', label: 'abr/27', beforePercent: 22, afterPercent: 22 },
            ]}
          />
        </div>
      ),
    },
    {
      name: 'Acima de 100%',
      render: () => (
        <div className={BOX}>
          <ComingMonthsBars
            referencePercent={70}
            months={[
              { key: 'nov', label: 'nov/26', beforePercent: 58, afterPercent: 412 },
              { key: 'dez', label: 'dez/26', beforePercent: 64, afterPercent: 380 },
            ]}
          />
        </div>
      ),
    },
  ],
}
