import { Button } from '@web/components/actions/button'
import { MomentSheet } from '@web/components/feedback/moment-sheet/moment-sheet'
import type { ComponentExamples } from '@web/lib/examples.types'
import { useState } from 'react'

function Example() {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <Button variant="outline" onClick={() => setIsOpen(true)}>
        Abrir
      </Button>
      <MomentSheet
        art="wallet"
        title="Conta Z criada"
        text="Quanto tem nela hoje? Com o saldo inicial, os saldos e a previsão batem com o banco."
        actionLabel="Informar saldo inicial"
        dismissLabel="Agora não"
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        onAction={() => setIsOpen(false)}
      />
    </>
  )
}

export const momentSheetExamples: ComponentExamples = {
  component: 'MomentSheet',
  examples: [{ name: 'Conta criada', render: () => <Example /> }],
}
