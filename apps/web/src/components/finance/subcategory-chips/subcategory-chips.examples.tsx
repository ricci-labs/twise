import { SubcategoryAddChip } from '@web/components/finance/subcategory-add-chip'
import { SubcategoryChip } from '@web/components/finance/subcategory-chip'
import { SubcategoryChips } from '@web/components/finance/subcategory-chips/subcategory-chips'
import type { ComponentExamples } from '@web/lib/examples.types'
import { useState } from 'react'

const LABELS = [
  'Aluguel',
  'Condomínio',
  'Luz e água',
  'Internet',
  'Gás',
  'IPTU',
  'Manutenção',
  'Limpeza',
  'Móveis',
  'Decoração',
]

function ManyChips() {
  const [isExpanded, setIsExpanded] = useState(false)
  return (
    <div className="w-full max-w-120">
      <SubcategoryChips
        labels={LABELS}
        chips={LABELS.map((label) => <SubcategoryChip key={label} label={label} tone="plain" />)}
        add={<SubcategoryAddChip label="Nova subcategoria em Casa" link={<a href="#nova" />} />}
        isExpanded={isExpanded}
        onExpandedChange={setIsExpanded}
      />
    </div>
  )
}

export const subcategoryChipsExamples: ComponentExamples = {
  component: 'SubcategoryChips',
  examples: [{ name: 'Muitas subcategorias numa linha', render: () => <ManyChips /> }],
}
