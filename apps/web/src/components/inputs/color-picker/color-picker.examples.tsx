import { ColorPicker } from '@web/components/inputs/color-picker/color-picker'
import type { ComponentExamples } from '@web/lib/examples.types'
import { ACCOUNT_COLORS } from '@web/styles/account-colors'
import { useState } from 'react'

function Example({ initial }: { initial: string }) {
  const [value, setValue] = useState(initial)
  return <ColorPicker label="Cor" value={value} onSelect={setValue} />
}

export const colorPickerExamples: ComponentExamples = {
  component: 'ColorPicker',
  examples: [
    { name: 'Sem cor', render: () => <Example initial="" /> },
    { name: 'Rosa escolhida', render: () => <Example initial={ACCOUNT_COLORS[5].value} /> },
  ],
}
