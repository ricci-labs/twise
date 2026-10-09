import { Amount } from '@web/components/display/amount/amount'
import type { ComponentExamples } from '@web/lib/examples.types'

export const amountExamples: ComponentExamples = {
  component: 'Amount',
  examples: [
    {
      name: 'Herói (centavos elevados)',
      render: () => <Amount cents={234_000} size="hero" isCentsRaised />,
    },
    { name: 'Negativo', render: () => <Amount cents={-38_000} size="lg" tone="danger" /> },
    { name: 'Entrada', render: () => <Amount cents={150_000} tone="income" sign="always" /> },
    { name: 'Pequeno', render: () => <Amount cents={12_000} size="sm" /> },
  ],
}
