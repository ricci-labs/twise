import { NothingToCharge } from '@web/components/finance/nothing-to-charge/nothing-to-charge'
import type { ComponentExamples } from '@web/lib/examples.types'

export const nothingToChargeExamples: ComponentExamples = {
  component: 'NothingToCharge',
  examples: [
    {
      name: 'Já está numa cobrança, com a próxima parcela',
      render: () => (
        <NothingToCharge
          chargedOn="2026-10-20"
          next={{ dueOn: '2026-11-10', amountCents: 16000 }}
          onIncludeNext={() => undefined}
          className="max-w-100"
        />
      ),
    },
    {
      name: 'Já está numa cobrança, nada por vir',
      render: () => <NothingToCharge chargedOn="2026-10-20" className="max-w-100" />,
    },
    {
      name: 'Nada vence até a data, valor grande no celular',
      render: () => (
        <NothingToCharge
          next={{ dueOn: '2026-11-10', amountCents: 125652000 }}
          onIncludeNext={() => undefined}
          className="w-80"
        />
      ),
    },
  ],
}
