import { CyclePreview } from '@web/components/finance/cycle-preview/cycle-preview'
import type { ComponentExamples } from '@web/lib/examples.types'

export const cyclePreviewExamples: ComponentExamples = {
  component: 'CyclePreview',
  examples: [
    {
      name: 'Fecha dia 25, vence dia 4',
      render: () => (
        <div className="w-full max-w-90">
          <CyclePreview text="Compras até dia 25 entram na fatura que vence dia 4. Uma compra hoje entra na fatura que vence em **04/11**." />
        </div>
      ),
    },
  ],
}
