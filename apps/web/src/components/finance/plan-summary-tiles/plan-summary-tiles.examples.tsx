import { PlanSummaryTiles } from '@web/components/finance/plan-summary-tiles/plan-summary-tiles'
import type { ComponentExamples } from '@web/lib/examples.types'

export const planSummaryTilesExamples: ComponentExamples = {
  component: 'PlanSummaryTiles',
  examples: [
    {
      name: 'Falta pagar e falta receber',
      render: () => (
        <div className="w-full max-w-100">
          <PlanSummaryTiles
            label="Resumo do período"
            tiles={[
              { label: 'Falta pagar', amountCents: 54990, note: '4 contas, 1 atrasada' },
              { label: 'Falta receber', amountCents: 80000, tone: 'income', note: '1 receita' },
            ]}
          />
        </div>
      ),
    },
    {
      name: 'Em atraso e próximo vencimento de um contato',
      render: () => (
        <div className="w-full max-w-100">
          <PlanSummaryTiles
            label="Resumo de Member D"
            tiles={[
              { label: 'Em atraso', amountCents: 20000, tone: 'danger', note: 'desde 10/10' },
              { label: 'Próximo vencimento', amountCents: 16000, note: 'em 10/11' },
            ]}
          />
        </div>
      ),
    },
    {
      name: 'Contas fixas e receitas fixas por mês',
      render: () => (
        <div className="w-full max-w-100">
          <PlanSummaryTiles
            label="Por mês"
            tiles={[
              {
                label: 'Contas fixas por mês',
                amountCents: 348970,
                isEstimate: true,
                note: '8 contas; semanais e anuais pela média',
              },
              {
                label: 'Receitas fixas por mês',
                amountCents: 900000,
                tone: 'income',
                note: 'Sem a comissão, que é variável',
              },
            ]}
          />
        </div>
      ),
    },
    {
      name: 'Valores de 7 dígitos a 360 px',
      render: () => (
        <div className="w-full max-w-90">
          <PlanSummaryTiles
            label="Por mês"
            tiles={[
              { label: 'Contas fixas por mês', amountCents: 123456789, isEstimate: true },
              { label: 'Receitas fixas por mês', amountCents: 987654321, tone: 'income' },
            ]}
          />
        </div>
      ),
    },
  ],
}
