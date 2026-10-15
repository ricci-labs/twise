import { BudgetSummary } from '@web/components/finance/budget-summary/budget-summary'
import type { ComponentExamples } from '@web/lib/examples.types'

export const budgetSummaryExamples: ComponentExamples = {
  component: 'BudgetSummary',
  examples: [
    {
      name: 'Gasto das categorias com orçamento',
      render: () => (
        <div className="w-full max-w-100">
          <BudgetSummary
            title="Gasto nas categorias com orçamento"
            spentCents={201000}
            limitCents={320000}
            markPercent={52}
            legend="onde o gasto deveria estar hoje (dia 16 de 31)"
          />
        </div>
      ),
    },
    {
      name: 'Valores de 7 dígitos a 360 px',
      render: () => (
        <div className="w-full max-w-90">
          <BudgetSummary
            title="Gasto nas categorias com orçamento"
            spentCents={123456789}
            limitCents={987654321}
            markPercent={52}
            legend="onde o gasto deveria estar hoje (dia 16 de 31)"
          />
        </div>
      ),
    },
  ],
}
