import { InvoiceMonthStrip } from '@web/components/finance/invoice-month-strip/invoice-month-strip'
import type { ComponentExamples } from '@web/lib/examples.types'

const MONTHS = [
  ['ago', 'Paga'],
  ['set', 'Paga'],
  ['out', 'Paga'],
  ['nov', 'Aberta'],
  ['dez', 'Futura'],
  ['jan', 'Futura'],
] as const

export const invoiceMonthStripExamples: ComponentExamples = {
  component: 'InvoiceMonthStrip',
  examples: [
    {
      name: 'Faturas de um cartão, com a virada do ano',
      render: () => (
        <div className="w-full max-w-97.5">
          <InvoiceMonthStrip
            label="Faturas do Cartão X"
            allLabel="Todas"
            onAll={() => undefined}
            months={MONTHS.map(([month, status], position) => ({
              key: month,
              month,
              status,
              accessibleLabel: `Fatura de ${month}, ${status}`,
              yearBefore: month === 'jan' ? '2027' : undefined,
              isCurrent: position === 3,
              link: <a href={`#${month}`}>{month}</a>,
            }))}
          />
        </div>
      ),
    },
  ],
}
