import { AttachArea } from '@web/components/finance/attach-area/attach-area'
import type { ComponentExamples } from '@web/lib/examples.types'

export const attachAreaExamples: ComponentExamples = {
  component: 'AttachArea',
  examples: [
    {
      name: 'Anexar comprovante',
      render: () => (
        <div className="w-full max-w-90">
          <AttachArea onPress={() => undefined} />
        </div>
      ),
    },
  ],
}
