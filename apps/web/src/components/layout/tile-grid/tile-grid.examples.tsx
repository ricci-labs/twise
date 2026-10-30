import { TileGrid } from '@web/components/layout/tile-grid/tile-grid'
import type { ComponentExamples } from '@web/lib/examples.types'

const TILE = 'rounded-xl border border-border bg-surface p-4 text-body'

function tiles(count: number) {
  return Array.from({ length: count }, (_, index) => `Bloco ${index + 1}`).map((name) => (
    <div key={name} className={TILE}>
      {name}
    </div>
  ))
}

export const tileGridExamples: ComponentExamples = {
  component: 'TileGrid',
  examples: [
    { name: 'Um bloco ocupa a linha', render: () => <TileGrid>{tiles(1)}</TileGrid> },
    { name: 'Cinco viram 3 + 2 mais largos', render: () => <TileGrid>{tiles(5)}</TileGrid> },
    {
      name: 'Compacto, como lista',
      render: () => (
        <TileGrid density="compact" render={<ul />}>
          {['Viagem', 'Carro', 'Reforma'].map((name) => (
            <li key={name} className={TILE}>
              {name}
            </li>
          ))}
        </TileGrid>
      ),
    },
  ],
}
