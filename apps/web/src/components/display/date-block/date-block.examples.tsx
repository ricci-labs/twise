import { DateBlock } from '@web/components/display/date-block/date-block'
import type { ComponentExamples } from '@web/lib/examples.types'

export const dateBlockExamples: ComponentExamples = {
  component: 'DateBlock',
  examples: [
    {
      name: 'Padrão, atrasado, passado e o próximo',
      render: () => (
        <div className="flex gap-3">
          <DateBlock date="2026-11-03" />
          <DateBlock date="2026-10-18" tone="overdue" />
          <DateBlock date="2026-01-01" tone="past" digits="padded" />
          <DateBlock date="2026-11-02" tone="next" digits="padded" />
        </div>
      ),
    },
  ],
}
