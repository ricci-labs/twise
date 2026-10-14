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

const OVERDUE_INVOICES = Array.from({ length: 14 }, (_, position) => ({
  value: `invoice-${position + 1}`,
  label: `Vence 04/${String(position + 1).padStart(2, '0')}`,
  detail: 'Falta pagar **R$ 100,00**',
}))

function ManyInvoices() {
  const [value, setValue] = useState<string>('invoice-1')
  return (
    <div className="w-full max-w-100">
      <RadioCardList
        label="Fatura"
        options={OVERDUE_INVOICES}
        value={value}
        onSelect={setValue}
        searchLabel="Buscar fatura"
      />
    </div>
  )
}

const NATURES = [
  { value: 'fixed', label: 'Renda fixa', detail: 'ex.: salário' },
  { value: 'variable', label: 'Renda variável', detail: 'ex.: comissão' },
] as const

function Natures() {
  const [value, setValue] = useState<string>('variable')
  return (
    <div className="w-full max-w-90">
      <RadioCardList
        label="Natureza da receita"
        layout="pair"
        options={NATURES}
        value={value}
        onSelect={setValue}
      />
    </div>
  )
}

export const radioCardListExamples: ComponentExamples = {
  component: 'RadioCardList',
  examples: [
    { name: 'Faturas do cartão', render: () => <Invoices /> },
    { name: 'Muitas faturas: 5 primeiro, busca acima de 10', render: () => <ManyInvoices /> },
    { name: 'Dois cartões lado a lado', render: () => <Natures /> },
  ],
}
