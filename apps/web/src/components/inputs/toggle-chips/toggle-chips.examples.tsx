import { ToggleChips } from '@web/components/inputs/toggle-chips/toggle-chips'
import type { ComponentExamples } from '@web/lib/examples.types'
import { useState } from 'react'

const TYPES = [
  { value: 'expense', label: 'Despesa' },
  { value: 'card_purchase', label: 'Compra no cartão' },
  { value: 'income', label: 'Receita' },
  { value: 'transfer', label: 'Transferência' },
  { value: 'invoice_payment', label: 'Pagamento de fatura' },
  { value: 'settlement', label: 'Recebimento de contato' },
  { value: 'opening_balance', label: 'Saldo inicial' },
]

function Example() {
  const [value, setValue] = useState<string[]>(['card_purchase'])
  return (
    <div className="w-full max-w-90">
      <ToggleChips label="Tipo" options={TYPES} value={value} onChange={setValue} />
    </div>
  )
}

export const toggleChipsExamples: ComponentExamples = {
  component: 'ToggleChips',
  examples: [{ name: 'Tipos: um ou mais', render: () => <Example /> }],
}
