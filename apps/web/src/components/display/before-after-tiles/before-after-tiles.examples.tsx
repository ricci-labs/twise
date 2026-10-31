import { BeforeAfterTiles } from '@web/components/display/before-after-tiles/before-after-tiles'
import type { ComponentExamples } from '@web/lib/examples.types'
import { LONG_TEXT } from '@web/testing/long-text'

const ITEMS = [
  { label: 'Livre para gastar', beforeCents: 234000, afterCents: 180000 },
  { label: 'Por dia, até 4 nov', beforeCents: 14625, afterCents: 11250 },
  { label: 'Limite livre do Cartão X', beforeCents: 800000, afterCents: 476000 },
]

export const beforeAfterTilesExamples: ComponentExamples = {
  component: 'BeforeAfterTiles',
  examples: [
    {
      name: 'Linhas (celular)',
      render: () => (
        <div className="w-full max-w-100 rounded-lg border border-border bg-surface px-4">
          <BeforeAfterTiles items={ITEMS} />
        </div>
      ),
    },
    {
      name: 'Blocos (desktop), negativo e sem mudança',
      render: () => (
        <div className="w-full max-w-150 rounded-lg border border-border bg-surface p-4">
          <BeforeAfterTiles
            layout="tiles"
            items={[
              { label: 'Livre para gastar', beforeCents: 234000, afterCents: -92000 },
              { label: 'Por dia, até 4 nov', beforeCents: 14625, afterCents: 14625 },
              {
                label: `Saldo de hoje da ${LONG_TEXT.account}`,
                beforeCents: 312000,
                afterCents: -12345678,
              },
            ]}
          />
        </div>
      ),
    },
  ],
}
