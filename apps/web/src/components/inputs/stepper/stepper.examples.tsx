import { Stepper } from '@web/components/inputs/stepper/stepper'
import type { ComponentExamples } from '@web/lib/examples.types'
import { useState } from 'react'

function Installments() {
  const [count, setCount] = useState(3)
  return (
    <Stepper
      value={count}
      min={1}
      max={48}
      onChange={setCount}
      valueText={count === 1 ? 'À vista' : `${count}×`}
      decreaseLabel="Menos uma parcela"
      increaseLabel="Mais uma parcela"
      aside={count === 1 ? undefined : `${count}× de **R$ 333,34**`}
    />
  )
}

function FirstInstallment() {
  const [first, setFirst] = useState(4)
  return (
    <Stepper
      value={first}
      min={1}
      max={10}
      onChange={setFirst}
      valueText={String(first)}
      decreaseLabel="Parcela anterior"
      increaseLabel="Próxima parcela"
      aside="de 10"
    />
  )
}

export const stepperExamples: ComponentExamples = {
  component: 'Stepper',
  examples: [
    { name: 'Parcelas', render: () => <Installments /> },
    { name: 'Começar da parcela', render: () => <FirstInstallment /> },
  ],
}
