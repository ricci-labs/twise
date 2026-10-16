import { Switch } from '@web/components/inputs/switch/switch'
import type { ComponentExamples } from '@web/lib/examples.types'
import { useState } from 'react'

function Example({ initial }: { initial: boolean }) {
  const [isChecked, setIsChecked] = useState(initial)
  return (
    <div className="w-full max-w-100">
      <Switch label="Compra já em andamento" isChecked={isChecked} onCheckedChange={setIsChecked} />
    </div>
  )
}

function WithHelp() {
  const [isChecked, setIsChecked] = useState(false)
  return (
    <div className="w-full max-w-100">
      <Switch
        label="O valor muda todo mês (aproximado)"
        help="Ex.: a conta de luz. O valor aparece com ≈ e a sugestão de pagamento aceita uma diferença maior."
        isChecked={isChecked}
        onCheckedChange={setIsChecked}
      />
    </div>
  )
}

export const switchExamples: ComponentExamples = {
  component: 'Switch',
  examples: [
    { name: 'Desligada', render: () => <Example initial={false} /> },
    { name: 'Ligada', render: () => <Example initial /> },
    { name: 'Com ajuda', render: () => <WithHelp /> },
  ],
}
