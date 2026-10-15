import { InvoiceLine } from '@web/components/finance/invoice-line/invoice-line'
import type { ComponentExamples } from '@web/lib/examples.types'

export const invoiceLineExamples: ComponentExamples = {
  component: 'InvoiceLine',
  examples: [
    {
      name: 'Compra, parcela, de terceiros e pagamento',
      render: () => (
        <ul className="w-full max-w-90 rounded-lg border border-border bg-surface px-3">
          <InvoiceLine
            date="03/10"
            description="Pagamento"
            detail="Com a Conta X"
            icon="invoice-paid"
            amountCents={-162000}
            isPayment
          />
          <InvoiceLine
            date="24/10"
            description="Mercado da semana"
            icon="groceries"
            amountCents={8640}
          />
          <InvoiceLine
            date="22/10"
            description="Tênis de corrida"
            icon="leisure"
            installment="1/3"
            amountCents={33334}
          />
          <InvoiceLine
            date="20/10"
            description="Jantar de aniversário"
            icon="leisure"
            detail="R$ 160,00 de terceiros"
            amountCents={24000}
          />
        </ul>
      ),
    },
    {
      name: 'Texto longo no celular',
      render: () => (
        <ul className="w-80 rounded-lg border border-border bg-surface px-3">
          <InvoiceLine
            date="20/10"
            description="Internet fibra 1 giga com TV e telefone"
            icon="house"
            installment="10/12"
            detail="R$ 1.000.000,00 de terceiros · Fulana de Tal dos Santos Silva"
            amountCents={123456789}
          />
        </ul>
      ),
    },
  ],
}
