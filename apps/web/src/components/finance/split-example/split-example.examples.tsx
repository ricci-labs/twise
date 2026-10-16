import { SplitExample } from '@web/components/finance/split-example/split-example'
import type {
  SplitExampleChoice,
  SplitExamplePart,
} from '@web/components/finance/split-example/split-example.types'
import type { ComponentExamples } from '@web/lib/examples.types'
import { useState } from 'react'

const PARTS: readonly SplitExamplePart[] = [
  { position: 1, label: 'Poupança (reserva)', amountCents: 60000 },
  { position: 2, label: 'Cobrir o orçamento', amountCents: 6000 },
  { position: 3, label: 'Conta Viagem (20%)', amountCents: 30000 },
  { position: 4, label: 'Conta X (o que sobrou)', amountCents: 54000 },
]

const SKIPPED_PARTS: readonly SplitExamplePart[] = [
  { position: 1, label: 'Poupança (reserva)', amountCents: 60000 },
  { position: 2, label: 'Troca do carro (pulado)', amountCents: null },
  { position: 3, label: 'Conta Viagem (20%)', amountCents: 30000 },
  { position: 4, label: 'Conta X (o que sobrou)', amountCents: 60000 },
]

const LONG_PARTS: readonly SplitExamplePart[] = [
  {
    position: 1,
    label: 'Investimento para a troca do carro da família em 2027',
    amountCents: 125620000,
  },
  { position: 2, label: 'Conta Conjunta do Banco Exemplo (20%)', amountCents: 31405000 },
]

const LEFTOVER_PARTS: readonly SplitExamplePart[] = [
  { position: 1, label: 'Poupança (reserva)', amountCents: 60000 },
  { position: 2, label: 'Conta Viagem (20%)', amountCents: 30000 },
]

function Example({
  parts,
  leftoverCents = 0,
  amountCents = 150000,
  hasBar = false,
}: {
  parts: readonly SplitExamplePart[]
  leftoverCents?: number
  amountCents?: number
  hasBar?: boolean
}) {
  const [choice, setChoice] = useState<SplitExampleChoice>('current')
  const [customAmount, setCustomAmount] = useState('')
  return (
    <div className="w-full max-w-100">
      <SplitExample
        choice={choice}
        onChoiceChange={setChoice}
        customAmount={customAmount}
        onCustomAmountChange={setCustomAmount}
        amountCents={amountCents}
        parts={parts}
        leftoverCents={leftoverCents}
        hasBar={hasBar}
      />
    </div>
  )
}

export const splitExampleExamples: ComponentExamples = {
  component: 'SplitExample',
  examples: [
    { name: 'Esta comissão', render: () => <Example parts={PARTS} /> },
    { name: 'Passo pulado (meta excluída)', render: () => <Example parts={SKIPPED_PARTS} /> },
    {
      name: 'Com a barra (desktop) e sobra sem destino',
      render: () => <Example parts={LEFTOVER_PARTS} leftoverCents={60000} hasBar />,
    },
    { name: 'Com a barra (desktop)', render: () => <Example parts={PARTS} hasBar /> },
    {
      name: 'Texto longo e valores de 7 dígitos',
      render: () => <Example parts={LONG_PARTS} amountCents={157025000} hasBar />,
    },
  ],
}
