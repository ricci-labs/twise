import { CategoryArt } from '@web/components/display/category-art/category-art'
import type { ComponentExamples } from '@web/lib/examples.types'

export const categoryArtExamples: ComponentExamples = {
  component: 'CategoryArt',
  examples: [
    {
      name: 'Solta, sobre fundo branco',
      render: () => (
        <div className="flex items-center gap-3 rounded-md bg-surface p-3">
          <CategoryArt name="Mercado" icon="groceries" />
          <CategoryArt name="Lazer" icon="leisure" size="lg" />
          <CategoryArt name="Transporte" icon="transport" size="sm" />
          <CategoryArt name="Viagem" icon="travel" />
        </div>
      ),
    },
    {
      name: 'Sobre um fundo sempre claro (quadro da grade de categorias)',
      render: () => (
        <div className="flex gap-3">
          <span className="rounded-lg bg-sketch-paper p-2">
            <CategoryArt name="Mercado" icon="groceries" variant="onLight" size="xl" />
          </span>
          <span className="rounded-lg bg-mint p-2">
            <CategoryArt name="Saúde" icon="health" variant="onLight" size="xl" />
          </span>
        </div>
      ),
    },
    { name: 'Sem ilustração', render: () => <CategoryArt name="Outros" icon={null} /> },
  ],
}
