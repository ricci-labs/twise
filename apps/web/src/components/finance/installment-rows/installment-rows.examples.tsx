import { InstallmentRows } from '@web/components/finance/installment-rows/installment-rows'
import type { InstallmentRow } from '@web/components/finance/installment-rows/installment-rows.types'
import type { ComponentExamples } from '@web/lib/examples.types'

const MONTHS = [
  'Outubro',
  'Novembro',
  'Dezembro',
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
]

const STATUSES = [
  { label: 'Fechada', tone: 'warning' },
  { label: 'Aberta', tone: 'info' },
  { label: 'Futura', tone: 'neutral' },
] as const

function rows(count: number): InstallmentRow[] {
  return Array.from({ length: count }, (_, index) => ({
    key: String(index),
    number: `${index + 1}/${count}`,
    month: MONTHS[index] ?? '',
    due: `vence 04/${String(((index + 9) % 12) + 1).padStart(2, '0')}`,
    status: STATUSES[Math.min(index, STATUSES.length - 1)] ?? STATUSES[0],
    amountCents: 30000,
  }))
}

export const installmentRowsExamples: ComponentExamples = {
  component: 'InstallmentRows',
  examples: [
    {
      name: 'Três parcelas',
      render: () => (
        <div className="w-full max-w-90">
          <InstallmentRows rows={rows(3)} />
        </div>
      ),
    },
    {
      name: 'Dez parcelas, três à vista',
      render: () => (
        <div className="w-full max-w-90">
          <InstallmentRows rows={rows(10)} />
        </div>
      ),
    },
    {
      name: 'Valor de 7 dígitos no celular',
      render: () => (
        <div className="w-80">
          <InstallmentRows rows={rows(3).map((row) => ({ ...row, amountCents: 123456789 }))} />
        </div>
      ),
    },
  ],
}
