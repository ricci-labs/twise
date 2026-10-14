import { TextArea } from '@web/components/inputs/text-area/text-area'
import type { ComponentExamples } from '@web/lib/examples.types'

export const textAreaExamples: ComponentExamples = {
  component: 'TextArea',
  examples: [
    {
      name: 'Observações',
      render: () => (
        <div className="flex w-full max-w-100 flex-col gap-2">
          <label htmlFor="notes" className="text-label text-ink">
            Observações
          </label>
          <TextArea id="notes" />
        </div>
      ),
    },
  ],
}
