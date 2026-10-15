import { Button } from '@web/components/actions/button'
import { MatchQuestion } from '@web/components/finance/match-question/match-question'
import type { MatchOption } from '@web/components/finance/match-question/match-question.types'
import type { ComponentExamples } from '@web/lib/examples.types'
import { useState } from 'react'

const INTERNET: MatchOption = {
  value: 'internet',
  title: 'Internet',
  detail: 'Prevista para 18/10 · R$ 120,00 · Conta X',
}

const SUGGESTED: readonly MatchOption[] = [
  { value: 'light', title: 'Luz', detail: 'Prevista para 22/10 · ≈ R$ 180,00' },
  { value: 'internet', title: 'Internet', detail: 'Atrasada desde 18/10 · R$ 120,00' },
]

function Example({
  options,
  isAfterPlan,
}: {
  options: readonly MatchOption[]
  isAfterPlan: boolean
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [value, setValue] = useState<string | null>(options[0]?.value ?? null)
  return (
    <>
      <Button variant="outline" onClick={() => setIsOpen(true)}>
        {isAfterPlan ? 'Depois de "Registrar pagamento"' : 'Depois de qualquer lançamento'}
      </Button>
      <MatchQuestion
        title={
          isAfterPlan
            ? 'Este lançamento paga a Internet de 18/10?'
            : 'Isto paga alguma conta prevista?'
        }
        lead={
          isAfterPlan
            ? undefined
            : 'Você registrou **Conta de luz**, R$ 214,37, pela Conta Y. Ela parece com:'
        }
        note={
          isAfterPlan
            ? 'Você acabou de registrar **Internet**, R$ 120,00, pela Conta X.'
            : undefined
        }
        options={options}
        optionsLabel="Contas previstas"
        value={value}
        onValueChange={setValue}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        declineLabel={isAfterPlan ? 'Não' : 'Não, nenhuma'}
        confirmLabel={isAfterPlan ? 'Sim, paga' : 'Paga a Luz'}
        onDecline={() => setIsOpen(false)}
        onConfirm={() => setIsOpen(false)}
      />
    </>
  )
}

export const matchQuestionExamples: ComponentExamples = {
  component: 'MatchQuestion',
  examples: [
    {
      name: 'Uma conta: a pergunta depois de "Registrar pagamento"',
      render: () => <Example options={[INTERNET]} isAfterPlan />,
    },
    {
      name: 'Várias: a sugestão depois de qualquer lançamento',
      render: () => <Example options={SUGGESTED} isAfterPlan={false} />,
    },
  ],
}
