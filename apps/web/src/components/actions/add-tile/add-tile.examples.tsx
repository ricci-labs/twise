import { AddTile } from '@web/components/actions/add-tile/add-tile'
import type { ComponentExamples } from '@web/lib/examples.types'

export const addTileExamples: ComponentExamples = {
  component: 'AddTile',
  examples: [
    {
      name: 'Novo cartão',
      render: () => (
        <div className="w-full max-w-90">
          <AddTile
            title="Novo cartão"
            text="Cadastre com os dias de fechamento e vencimento."
            link={<a href="#novo-cartao">Novo cartão</a>}
          />
        </div>
      ),
    },
  ],
}
