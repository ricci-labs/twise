import { BudgetRow } from '@web/components/finance/budget-row/budget-row'
import type { ComponentExamples } from '@web/lib/examples.types'
import type { ReactNode } from 'react'

function Card({ children }: { children: ReactNode }) {
  return (
    <ul className="w-full max-w-100 rounded-xl border border-border bg-surface px-3">{children}</ul>
  )
}

function noop() {}

export const budgetRowExamples: ComponentExamples = {
  component: 'BudgetRow',
  examples: [
    {
      name: 'Estourado, acima do ritmo e no ritmo',
      render: () => (
        <Card>
          <BudgetRow
            name="Lazer"
            art={{ name: 'Lazer', icon: 'leisure' }}
            spentCents={46000}
            limitCents={40000}
            markPercent={52}
            status="over"
            statusText="Estourado: passou R$ 60,00"
          />
          <BudgetRow
            name="Mercado"
            art={{ name: 'Mercado', icon: 'groceries' }}
            spentCents={82000}
            limitCents={120000}
            markPercent={52}
            status="ahead"
            statusText="Acima do ritmo: 16 pontos à frente"
            subcategories={[
              { label: 'Feira', amountCents: 21000 },
              { label: 'Padaria', amountCents: 9500 },
            ]}
            moreHint="subcategorias de Mercado"
            onMore={noop}
          />
          <BudgetRow
            name="Saúde"
            art={{ name: 'Saúde', icon: 'health' }}
            spentCents={9000}
            limitCents={30000}
            markPercent={52}
            status="within"
            statusText="No ritmo"
            subcategories={[{ label: 'Farmácia', amountCents: 9000 }]}
          />
        </Card>
      ),
    },
    {
      name: 'Nome longo e valores de 7 dígitos',
      render: () => (
        <Card>
          <BudgetRow
            name="Internet fibra 1 giga com TV e telefone da casa da praia"
            art={{ name: 'Casa', icon: 'home' }}
            spentCents={123456789}
            limitCents={150000000}
            markPercent={52}
            status="ahead"
            statusText="Acima do ritmo: 30 pontos à frente"
          />
        </Card>
      ),
    },
  ],
}
