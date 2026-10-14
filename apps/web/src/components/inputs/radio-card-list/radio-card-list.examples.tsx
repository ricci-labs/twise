import { RadioCardList } from '@web/components/inputs/radio-card-list/radio-card-list'
import type { ComponentExamples } from '@web/lib/examples.types'
import { useState } from 'react'

const INVOICES = [
  {
    value: 'nov',
    label: 'Vence 04/11',
    detail: 'Falta pagar **R$ 1.950,00**',
    badge: { label: 'Aberta', tone: 'warning' },
  },
  {
    value: 'dec',
    label: 'Vence 04/12',
    detail: 'Falta pagar **R$ 640,00**',
    badge: { label: 'Futura', tone: 'neutral' },
  },
] as const

function Invoices() {
  const [value, setValue] = useState<string>('nov')
  return (
    <div className="w-full max-w-100">
      <RadioCardList label="Fatura" options={INVOICES} value={value} onSelect={setValue} />
    </div>
  )
}

export const radioCardListExamples: ComponentExamples = {
  component: 'RadioCardList',
  examples: [{ name: 'Faturas do cartão', render: () => <Invoices /> }],
}
