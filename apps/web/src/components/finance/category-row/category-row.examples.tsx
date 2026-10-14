import { Badge } from '@web/components/display/badge'
import { CategoryRow } from '@web/components/finance/category-row/category-row'
import { SubcategoryChip } from '@web/components/finance/subcategory-chip'
import type { ComponentExamples } from '@web/lib/examples.types'
import { useState } from 'react'

function OpenExample() {
  const [isOpen, setIsOpen] = useState(true)
  return (
    <CategoryRow
      name="Mercado"
      icon="groceries"
      subcategoryCount={2}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
    >
      <SubcategoryChip label="Feira" />
      <SubcategoryChip label="Padaria" />
    </CategoryRow>
  )
}

export const categoryRowExamples: ComponentExamples = {
  component: 'CategoryRow',
  examples: [
    {
      name: 'Com subcategorias, receita e arquivada',
      render: () => (
        <ul className="w-full max-w-90 rounded-lg border border-border bg-surface px-3 py-1">
          <OpenExample />
          <CategoryRow
            name="Salário"
            icon="coin"
            badge={
              <Badge tone="success" size="sm">
                Fixa
              </Badge>
            }
          />
          <CategoryRow
            name="Viagem"
            icon="travel"
            detail="Categoria de despesa · com Hotel e Passagem"
          >
            <SubcategoryChip label="Hotel" tone="archived" />
            <SubcategoryChip label="Passagem" tone="archived" />
          </CategoryRow>
        </ul>
      ),
    },
  ],
}
