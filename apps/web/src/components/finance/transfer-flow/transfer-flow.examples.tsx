import { TransferFlow } from '@web/components/finance/transfer-flow/transfer-flow'
import type { ComponentExamples } from '@web/lib/examples.types'

export const transferFlowExamples: ComponentExamples = {
  component: 'TransferFlow',
  examples: [
    {
      name: 'De uma conta para outra',
      render: () => (
        <div className="w-full max-w-90">
          <TransferFlow
            from={{ name: 'Conta X', icon: 'wallet' }}
            to={{ name: 'Poupança', icon: 'piggy-bank' }}
            note="Transferência entre contas de vocês não conta como gasto nem como receita."
          />
        </div>
      ),
    },
  ],
}
