import { PaceRing } from '@web/components/charts/pace-ring/pace-ring'
import type { ComponentExamples } from '@web/lib/examples.types'

export const paceRingExamples: ComponentExamples = {
  component: 'PaceRing',
  examples: [
    {
      name: 'À frente do ritmo',
      render: () => (
        <PaceRing
          usedPercent={74}
          elapsedPercent={52}
          centerLabel="74%"
          centerCaption="da renda"
          description="Renda já usada 74%, período passado 52%."
        />
      ),
    },
  ],
}
