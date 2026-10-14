import { Select } from '@web/components/inputs/select/select'
import type { ComponentExamples } from '@web/lib/examples.types'

const METHODS = [
  { value: 'pix', label: 'Pix' },
  { value: 'debit', label: 'Débito' },
  { value: 'credit', label: 'Crédito' },
  { value: 'cash', label: 'Dinheiro' },
]

export const selectExamples: ComponentExamples = {
  component: 'Select',
  examples: [
    {
      name: 'Forma de pagamento',
      render: () => (
        <div className="flex w-full max-w-100 flex-col gap-2">
          <label htmlFor="method" className="text-label text-ink">
            Forma de pagamento
          </label>
          <Select id="method" options={METHODS} placeholder="Escolha" defaultValue="pix" />
        </div>
      ),
    },
  ],
}
