import { Button } from '@web/components/actions/button'
import { InvoiceSummary } from '@web/components/finance/invoice-summary/invoice-summary'
import type { ComponentExamples } from '@web/lib/examples.types'

const PARTS = {
  paid: { label: 'Pago', cents: 0 },
  due: { label: 'Falta pagar', cents: 195000 },
  own: { label: 'Seu', cents: 171000 },
  fronted: { label: 'De terceiros', cents: 24000 },
}

export const invoiceSummaryExamples: ComponentExamples = {
  component: 'InvoiceSummary',
  examples: [
    {
      name: 'Aberta, com o pagamento',
      render: () => (
        <div className="w-full max-w-90">
          <InvoiceSummary
            title="Fatura de novembro"
            status={{ label: 'Aberta', tone: 'warning' }}
            dates="Fecha 25/10 · vence 04/11"
            totalCents={195000}
            {...PARTS}
            splitLabel="Seu R$ 1.710,00, de terceiros R$ 240,00"
            action={<Button width="full">Pagar fatura</Button>}
          />
        </div>
      ),
    },
    {
      name: 'Paga',
      render: () => (
        <div className="w-full max-w-90">
          <InvoiceSummary
            title="Fatura de outubro"
            status={{ label: 'Paga', tone: 'success' }}
            dates="Fecha 25/09 · vence 04/10"
            totalCents={162000}
            paid={{ label: 'Pago', cents: 162000 }}
            due={{ label: 'Falta pagar', cents: 0 }}
            own={{ label: 'Seu', cents: 150000 }}
            fronted={{ label: 'De terceiros', cents: 12000 }}
            splitLabel="Seu R$ 1.500,00, de terceiros R$ 120,00"
            note={{ icon: 'ok', tone: 'success', text: 'Paga em 03/10 com a Conta X.' }}
          />
        </div>
      ),
    },
  ],
}
