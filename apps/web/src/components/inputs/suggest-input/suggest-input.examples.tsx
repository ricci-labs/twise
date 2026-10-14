import { SuggestInput } from '@web/components/inputs/suggest-input/suggest-input'
import type { ComponentExamples } from '@web/lib/examples.types'
import { useState } from 'react'

const RECENT = ['Mercado da semana', 'Mercado', 'Mercado Livre']

function Example() {
  const [value, setValue] = useState('Mer')
  return (
    <div className="w-full max-w-90">
      <SuggestInput
        aria-label="Descrição"
        value={value}
        suggestions={value.trim() === '' ? [] : RECENT}
        onChange={(change) => setValue(change.target.value)}
        onPick={setValue}
      />
    </div>
  )
}

export const suggestInputExamples: ComponentExamples = {
  component: 'SuggestInput',
  examples: [{ name: 'Descrições recentes', render: () => <Example /> }],
}
