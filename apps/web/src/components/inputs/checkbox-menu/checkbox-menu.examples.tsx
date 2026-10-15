import { CheckboxMenu } from '@web/components/inputs/checkbox-menu/checkbox-menu'
import { FilterButton } from '@web/components/inputs/filter-button'
import type { ComponentExamples } from '@web/lib/examples.types'
import { useState } from 'react'

const TYPES = [
  { value: 'expense', label: 'Despesa' },
  { value: 'card_purchase', label: 'Compra no cartão' },
  { value: 'income', label: 'Receita' },
  { value: 'transfer', label: 'Transferência' },
]

function Example() {
  const [types, setTypes] = useState<string[]>(['card_purchase'])
  return (
    <CheckboxMenu
      label="Tipo"
      trigger={
        <FilterButton label="Tipo" value={types.length > 0 ? `${types.length}` : undefined} />
      }
      options={TYPES}
      value={types}
      onChange={setTypes}
    />
  )
}

export const checkboxMenuExamples: ComponentExamples = {
  component: 'CheckboxMenu',
  examples: [{ name: 'Um ou mais tipos, com "Limpar"', render: () => <Example /> }],
}
