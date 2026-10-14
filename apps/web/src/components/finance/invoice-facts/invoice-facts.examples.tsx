import { Badge } from '@web/components/display/badge'
import { InvoiceFacts } from '@web/components/finance/invoice-facts/invoice-facts'
import type { ComponentExamples } from '@web/lib/examples.types'

export const invoiceFactsExamples: ComponentExamples = {
  component: 'InvoiceFacts',
  examples: [
    {
      name: 'Os números de uma fatura',
      render: () => (
        <div className="w-full max-w-90">
          <InvoiceFacts
            label="Resumo da fatura"
            facts={[
              { label: 'Total', value: 'R$ 1.950,00' },
              { label: 'Pago', value: 'R$ 0,00' },
              { label: 'Falta pagar', value: 'R$ 1.950,00' },
              { label: 'Seu', value: 'R$ 1.710,00' },
              { label: 'De terceiros', value: 'R$ 240,00' },
              {
                label: 'Situação',
                value: (
                  <Badge tone="warning" hasDot>
                    Aberta
                  </Badge>
                ),
              },
            ]}
          />
        </div>
      ),
    },
  ],
}
