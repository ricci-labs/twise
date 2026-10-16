import { Button } from '@web/components/actions/button'
import { ReserveCard } from '@web/components/finance/reserve-card/reserve-card'
import { TwiseIcon } from '@web/components/icons/twise-icon'
import type { ComponentExamples } from '@web/lib/examples.types'

const RESERVE = {
  savedCents: 1_200_000,
  targetCents: 1_800_000,
  accountName: 'Poupança',
  percent: 67,
  remainingCents: 600_000,
  overCents: 0,
  coverageMonths: 2.4,
}

export const reserveCardExamples: ComponentExamples = {
  component: 'ReserveCard',
  examples: [
    {
      name: 'Reserva com cobertura',
      render: () => (
        <div className="w-full max-w-100">
          <ReserveCard reserve={RESERVE} />
        </div>
      ),
    },
    {
      name: 'Valor de 7 dígitos e conta de nome longo a 360 px',
      render: () => (
        <div className="w-full max-w-90">
          <ReserveCard
            reserve={{
              ...RESERVE,
              savedCents: 125_620_000,
              targetCents: 300_000_000,
              accountName: 'Conta Conjunta Investimentos de Longo Prazo',
              percent: 42,
              remainingCents: 174_380_000,
            }}
          />
        </div>
      ),
    },
    {
      name: 'Sem reserva',
      render: () => (
        <div className="w-full max-w-100">
          <ReserveCard
            reserve={null}
            createAction={
              <Button size="sm">
                <TwiseIcon name="plus" size="sm" />
                Criar a reserva
              </Button>
            }
          />
        </div>
      ),
    },
  ],
}
