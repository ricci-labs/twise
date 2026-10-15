import { ShareRows } from '@web/components/finance/share-rows/share-rows'
import type { ComponentExamples } from '@web/lib/examples.types'

export const shareRowsExamples: ComponentExamples = {
  component: 'ShareRows',
  examples: [
    {
      name: 'Dividido com dois contatos',
      render: () => (
        <div className="w-full max-w-90">
          <ShareRows
            shares={[
              { key: 'c', name: 'Member C', amountCents: 8000 },
              { key: 'd', name: 'Member D', amountCents: 8000 },
            ]}
            ownCents={8000}
            note="Cada contato passa a dever a parte dele em Contatos e cobranças."
          />
        </div>
      ),
    },
    {
      name: 'Texto longo no celular',
      render: () => (
        <div className="w-80">
          <ShareRows
            shares={[
              {
                key: 'c',
                name: 'Fulana de Tal dos Santos Silva Internet fibra 1 giga',
                amountCents: 123456789,
              },
            ]}
            ownCents={123456789}
          />
        </div>
      ),
    },
  ],
}
