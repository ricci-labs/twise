import { Button } from '@web/components/actions/button'
import { InvoiceYearSheet } from '@web/components/finance/invoice-year-sheet/invoice-year-sheet'
import type { ComponentExamples } from '@web/lib/examples.types'
import { useState } from 'react'

const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

function Example() {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <Button variant="secondary" onClick={() => setIsOpen(true)}>
        Todas
      </Button>
      <InvoiceYearSheet
        title="Faturas do Cartão X"
        year="2026"
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        onPrevious={() => undefined}
        note="Cada fatura leva o mês em que vence."
        months={MONTHS.map((month, position) => ({
          key: month,
          month,
          status:
            position < 10
              ? { label: 'Paga', tone: 'success' }
              : { label: 'Aberta', tone: 'warning' },
          total: 'R$ 1.200,00',
          isCurrent: position === 10,
          link: <a href={`#${month}`}>{month}</a>,
        }))}
      />
    </>
  )
}

export const invoiceYearSheetExamples: ComponentExamples = {
  component: 'InvoiceYearSheet',
  examples: [{ name: 'Um ano de faturas', render: () => <Example /> }],
}
