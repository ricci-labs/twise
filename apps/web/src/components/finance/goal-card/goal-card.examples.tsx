import { GoalCard } from '@web/components/finance/goal-card/goal-card'
import type { GoalCardProps } from '@web/components/finance/goal-card/goal-card.types'
import type { ComponentExamples } from '@web/lib/examples.types'

const TRIP: GoalCardProps = {
  name: 'Viagem para o Chile',
  art: { name: 'Conta Viagem', icon: 'travel' },
  accountName: 'Conta Viagem',
  savedCents: 480_000,
  targetCents: 1_500_000,
  percent: 32,
  remainingCents: 1_020_000,
  overCents: 0,
  deadlineLabel: 'jul/27',
  monthlyToTargetCents: 113_400,
}

function List({ goals, width = 'max-w-100' }: { goals: GoalCardProps[]; width?: string }) {
  return (
    <ul className={`flex w-full flex-col gap-2.5 ${width}`}>
      {goals.map((goal) => (
        <GoalCard key={goal.name} {...goal} />
      ))}
    </ul>
  )
}

export const goalCardExamples: ComponentExamples = {
  component: 'GoalCard',
  examples: [
    { name: 'Com prazo', render: () => <List goals={[TRIP]} /> },
    {
      name: 'Sem prazo e meta atingida',
      render: () => (
        <List
          goals={[
            {
              ...TRIP,
              name: 'Troca do carro',
              art: { name: 'Investimento', icon: 'transport' },
              accountName: 'Investimento',
              percent: 20,
              deadlineLabel: null,
              monthlyToTargetCents: null,
            },
            {
              ...TRIP,
              name: 'Reforma da cozinha',
              art: { name: 'Caixinha Reforma', icon: 'house' },
              accountName: 'Caixinha Reforma',
              savedCents: 620_000,
              targetCents: 600_000,
              percent: 100,
              remainingCents: 0,
              overCents: 20_000,
              deadlineLabel: 'dez/26',
            },
          ]}
        />
      ),
    },
    {
      name: 'Nome longo e valores de 7 dígitos a 360 px',
      render: () => (
        <List
          width="max-w-90"
          goals={[
            {
              ...TRIP,
              name: 'Investimento para a troca do carro da família em 2027',
              accountName: 'Conta Conjunta Investimentos de Longo Prazo',
              savedCents: 125_620_000,
              targetCents: 400_000_000,
              remainingCents: 274_380_000,
              monthlyToTargetCents: 30_486_667,
            },
          ]}
        />
      ),
    },
  ],
}
