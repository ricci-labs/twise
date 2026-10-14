import { AutoFillTip } from '@web/components/feedback/auto-fill-tip/auto-fill-tip'
import type { ComponentExamples } from '@web/lib/examples.types'

export const autoFillTipExamples: ComponentExamples = {
  component: 'AutoFillTip',
  examples: [
    {
      name: 'Preenchido como da última vez',
      render: () => (
        <div className="w-full max-w-100">
          <AutoFillTip
            text="Preenchemos categoria, conta e forma de pagamento como da última vez."
            onUndo={() => undefined}
          />
        </div>
      ),
    },
  ],
}
