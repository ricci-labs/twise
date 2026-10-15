import { EntryHeader } from '@web/components/finance/entry-header/entry-header'
import type { ComponentExamples } from '@web/lib/examples.types'

export const entryHeaderExamples: ComponentExamples = {
  component: 'EntryHeader',
  examples: [
    {
      name: 'Compra parcelada',
      render: () => (
        <div className="w-full max-w-90">
          <EntryHeader
            art={{ name: 'Lazer', icon: 'leisure' }}
            typeLabel="Compra no cartão"
            description="Tênis de corrida"
            amountCents={100000}
            direction="out"
            detail="3× de R$ 333,34 · ter, 20 out 2026"
          />
        </div>
      ),
    },
    {
      name: 'Receita',
      render: () => (
        <div className="w-full max-w-90">
          <EntryHeader
            art={{ name: 'Comissão', icon: 'coin' }}
            typeLabel="Receita"
            description="Comissão de setembro"
            amountCents={280000}
            direction="in"
            detail="sáb, 10 out 2026"
          />
        </div>
      ),
    },
  ],
}
