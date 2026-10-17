import { ContactHeader } from '@web/components/finance/contact-header/contact-header'
import type { ComponentExamples } from '@web/lib/examples.types'

export const contactHeaderExamples: ComponentExamples = {
  component: 'ContactHeader',
  examples: [
    {
      name: 'Deve, com parcelas a vencer',
      render: () => (
        <div className="w-full max-w-100">
          <ContactHeader name="Member D" owedCents={52000} hasUpcoming />
        </div>
      ),
    },
    {
      name: 'Pediu para não receber mensagens',
      render: () => (
        <div className="w-full max-w-100">
          <ContactHeader name="Member E" owedCents={20000} isOptedOut />
        </div>
      ),
    },
    {
      name: 'Crédito e em dia',
      render: () => (
        <div className="flex w-full max-w-100 flex-col gap-4">
          <ContactHeader name="Member F" owedCents={-3000} />
          <ContactHeader name="Member G" owedCents={0} />
        </div>
      ),
    },
    {
      name: 'Nome longo e valor de 7 dígitos',
      render: () => (
        <div className="w-full max-w-100">
          <ContactHeader
            name="Maria Aparecida dos Santos Oliveira"
            owedCents={125652000}
            hasUpcoming
            isOptedOut
          />
        </div>
      ),
    },
  ],
}
