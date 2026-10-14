import { SubcategoryAddChip } from '@web/components/finance/subcategory-add-chip/subcategory-add-chip'
import type { ComponentExamples } from '@web/lib/examples.types'

export const subcategoryAddChipExamples: ComponentExamples = {
  component: 'SubcategoryAddChip',
  examples: [
    {
      name: 'Nova subcategoria',
      render: () => (
        <div className="flex gap-1.5">
          <SubcategoryAddChip label="Nova subcategoria em Mercado" link={<a href="#nova" />} />
          <SubcategoryAddChip
            label="Nova subcategoria em Lazer"
            text="Subcategoria"
            link={<a href="#nova-lazer" />}
          />
        </div>
      ),
    },
  ],
}
