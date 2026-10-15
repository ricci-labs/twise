import { FilterChips } from '@web/components/display/filter-chips/filter-chips'
import type { FilterChip } from '@web/components/display/filter-chips/filter-chips.types'
import type { ComponentExamples } from '@web/lib/examples.types'
import { useState } from 'react'

const CHIPS: readonly FilterChip[] = [
  { value: 'type', label: 'Compra no cartão' },
  { value: 'account', label: 'Cartão X' },
  { value: 'category', label: 'Mercado e subcategorias' },
]

function Example() {
  const [chips, setChips] = useState(CHIPS)
  return (
    <div className="w-full max-w-90">
      <FilterChips
        chips={chips}
        onRemove={(value) => setChips(chips.filter((chip) => chip.value !== value))}
        onClear={() => setChips([])}
      />
    </div>
  )
}

export const filterChipsExamples: ComponentExamples = {
  component: 'FilterChips',
  examples: [{ name: 'Filtros ativos, que quebram linha', render: () => <Example /> }],
}
