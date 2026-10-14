import { IllustrationPicker } from '@web/components/inputs/illustration-picker/illustration-picker'
import type { ComponentExamples } from '@web/lib/examples.types'
import { useState } from 'react'

function Example({ initial, name }: { initial: string; name: string }) {
  const [value, setValue] = useState(initial)
  return (
    <div className="w-full max-w-90">
      <IllustrationPicker label="Ilustração" name={name} value={value} onSelect={setValue} />
    </div>
  )
}

export const illustrationPickerExamples: ComponentExamples = {
  component: 'IllustrationPicker',
  examples: [
    { name: 'Sem ilustração: a inicial', render: () => <Example initial="" name="Conta Z" /> },
    { name: 'Carteira escolhida', render: () => <Example initial="wallet" name="Conta Y" /> },
  ],
}
