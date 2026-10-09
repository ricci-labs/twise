import { ProgressBar } from '@web/components/charts/progress-bar/progress-bar'
import type { ComponentExamples } from '@web/lib/examples.types'

export const progressBarExamples: ComponentExamples = {
  component: 'ProgressBar',
  examples: [
    {
      name: 'Estourou, adiantado, no ritmo',
      render: () => (
        <div className="flex w-60 flex-col gap-3">
          <ProgressBar percent={100} markPercent={52} tone="over" />
          <ProgressBar percent={68} markPercent={52} tone="ahead" />
          <ProgressBar percent={50} markPercent={52} />
        </div>
      ),
    },
  ],
}
