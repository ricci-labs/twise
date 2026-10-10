import { CategoryArt } from '@web/components/display/category-art/category-art'
import type { ComponentExamples } from '@web/lib/examples.types'

export const categoryArtExamples: ComponentExamples = {
  component: 'CategoryArt',
  examples: [
    {
      name: 'Com ilustração',
      render: () => (
        <div className="flex gap-3">
          <CategoryArt name="Mercado" icon="groceries" />
          <CategoryArt name="Lazer" icon="leisure" />
          <CategoryArt name="Transporte" icon="transport" size="sm" />
        </div>
      ),
    },
    { name: 'Sem ilustração', render: () => <CategoryArt name="Outros" icon={null} /> },
  ],
}
