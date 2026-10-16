import { FieldGroup } from '@web/components/forms/field-group/field-group'
import { ChoiceChips } from '@web/components/inputs/choice-chips'
import type { ComponentExamples } from '@web/lib/examples.types'
import { useState } from 'react'

const KINDS = [
  { value: 'checking', label: 'Conta corrente' },
  { value: 'savings', label: 'Poupança' },
]

function Example({ error }: { error?: string }) {
  const [value, setValue] = useState('checking')
  return (
    <div className="w-full max-w-90">
      <FieldGroup label="Tipo" isRequired help="O tipo não pode ser mudado depois." error={error}>
        <ChoiceChips label="Tipo" options={KINDS} value={value} onSelect={setValue} />
      </FieldGroup>
    </div>
  )
}

function WithNote() {
  const [value, setValue] = useState('checking')
  return (
    <div className="w-full max-w-90">
      <FieldGroup label="Tipo" note="Se o mês tiver menos dias, vale o último.">
        <ChoiceChips label="Tipo" options={KINDS} value={value} onSelect={setValue} />
      </FieldGroup>
    </div>
  )
}

export const fieldGroupExamples: ComponentExamples = {
  component: 'FieldGroup',
  examples: [
    { name: 'Escolha com ajuda', render: () => <Example /> },
    { name: 'Com erro', render: () => <Example error="Escolha um tipo." /> },
    { name: 'Com nota depois das escolhas', render: () => <WithNote /> },
  ],
}
