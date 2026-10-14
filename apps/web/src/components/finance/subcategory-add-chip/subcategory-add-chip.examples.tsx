import { SubcategoryAddChip } from '@web/components/finance/subcategory-add-chip/subcategory-add-chip'
import type { ComponentExamples } from '@web/lib/examples.types'

export const subcategoryAddChipExamples: ComponentExamples = {
  component: 'SubcategoryAddChip',
  examples: [
    {
      name: 'Nova subcategoria',
      render: () => (
        <SubcategoryAddChip label="Nova subcategoria em Mercado" link={<a href="#nova" />} />
      ),
    },
  ],
}
