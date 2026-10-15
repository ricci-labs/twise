import { LockedField } from '@web/components/forms/locked-field/locked-field'
import type { ComponentExamples } from '@web/lib/examples.types'

export const lockedFieldExamples: ComponentExamples = {
  component: 'LockedField',
  examples: [
    {
      name: 'Tipo que não muda',
      render: () => (
        <div className="w-full max-w-90">
          <LockedField
            label="Tipo"
            value="Conta corrente"
            help="O tipo não pode ser mudado depois."
          />
        </div>
      ),
    },
    {
      name: 'O que não muda, com a segunda linha',
      render: () => (
        <div className="w-full max-w-90">
          <LockedField
            label="O que não muda"
            value="R$ 3.000,00 em 10× · Cartão X"
            detail="Casa · seg, 12 out · Member A"
            help="A 1ª parcela está na fatura de outubro, que já fechou."
          />
        </div>
      ),
    },
  ],
}
