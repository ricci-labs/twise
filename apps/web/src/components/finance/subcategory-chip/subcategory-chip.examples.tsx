import { SubcategoryChip } from '@web/components/finance/subcategory-chip/subcategory-chip'
import type { ComponentExamples } from '@web/lib/examples.types'

export const subcategoryChipExamples: ComponentExamples = {
  component: 'SubcategoryChip',
  examples: [
    {
      name: 'Com ações, só para ver e arquivada',
      render: () => (
        <div className="flex flex-wrap gap-1.5">
          <SubcategoryChip label="Feira" aria-label="Feira, subcategoria de Mercado: ações" />
          <SubcategoryChip label="Padaria" tone="plain" />
          <SubcategoryChip label="Açougue" tone="archived" />
        </div>
      ),
    },
  ],
}
