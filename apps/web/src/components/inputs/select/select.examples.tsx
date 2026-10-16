import { Select } from '@web/components/inputs/select/select'
import type { SelectExampleProps } from '@web/components/inputs/select/select.types'
import type { ComponentExamples } from '@web/lib/examples.types'
import { useState } from 'react'

const METHODS = [
  { value: 'pix', label: 'Pix' },
  { value: 'debit', label: 'Débito' },
  { value: 'credit', label: 'Crédito' },
  { value: 'cash', label: 'Dinheiro' },
]

function PaymentMethod({ initial }: SelectExampleProps) {
  const [value, setValue] = useState(initial)
  return (
    <div className="flex w-full max-w-100 flex-col gap-2">
      <label htmlFor="method" className="text-label text-ink">
        Forma de pagamento
      </label>
      <Select
        id="method"
        title="Forma de pagamento"
        options={METHODS}
        placeholder="Escolha"
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
    </div>
  )
}

const BUSINESS_DAYS = Array.from({ length: 10 }, (_, index) => ({
  value: String(index + 1),
  label: `${index + 1}º`,
}))

function BusinessDay() {
  const [value, setValue] = useState('5')
  return (
    <p className="flex items-center gap-1.5 text-choice text-ink">
      No
      <Select
        size="inline"
        title="Dia útil"
        aria-label={`Dia útil: ${value}º`}
        options={BUSINESS_DAYS}
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      dia útil
    </p>
  )
}

export const selectExamples: ComponentExamples = {
  component: 'Select',
  examples: [
    { name: 'Escolhida', render: () => <PaymentMethod initial="pix" /> },
    { name: 'Vazia', render: () => <PaymentMethod initial="" /> },
    { name: 'Dentro de uma frase', render: () => <BusinessDay /> },
  ],
}
