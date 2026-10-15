import { RecurrenceRow } from '@web/components/finance/recurrence-row/recurrence-row'
import type { ComponentExamples } from '@web/lib/examples.types'
import type { ReactNode } from 'react'

function Card({ children }: { children: ReactNode }) {
  return (
    <ul className="w-full max-w-100 rounded-xl border border-border bg-surface px-3">{children}</ul>
  )
}

const HOME = { name: 'Casa', icon: 'home' }

export const recurrenceRowExamples: ComponentExamples = {
  component: 'RecurrenceRow',
  examples: [
    {
      name: 'Contas, receita e transferência',
      render: () => (
        <Card>
          <RecurrenceRow
            description="Aluguel"
            detail="Todo dia 5 · Conta X · Casa › Aluguel"
            next={{ label: 'Próxima 05/11', tone: 'neutral' }}
            art={HOME}
            amountCents={210000}
            direction="out"
          />
          <RecurrenceRow
            description="Luz"
            detail="Todo dia 22 · Conta Y · Casa › Luz e água"
            next={{ label: 'Vence hoje', tone: 'today' }}
            art={HOME}
            amountCents={18000}
            direction="out"
            isEstimate
          />
          <RecurrenceRow
            description="Internet"
            detail="Todo dia 18 · Conta X · Casa › Internet"
            next={{ label: 'Atrasada desde 18/10', tone: 'overdue' }}
            art={HOME}
            amountCents={12000}
            direction="out"
          />
          <RecurrenceRow
            description="Salário"
            detail="No 5º dia útil · Conta X · Salário"
            next={{ label: 'Próxima 07/11', tone: 'neutral' }}
            art={{ name: 'Salário', icon: 'salary' }}
            amountCents={620000}
            direction="in"
          />
          <RecurrenceRow
            description="Reserva de emergência"
            detail="Todo dia 10 · Conta X → Poupança"
            next={{ label: 'Próxima 10/11', tone: 'neutral' }}
            art={{ name: 'Transferência', icon: 'transfer' }}
            amountCents={60000}
            direction="neutral"
          />
        </Card>
      ),
    },
    {
      name: 'Texto longo e valor de 7 dígitos',
      render: () => (
        <Card>
          <RecurrenceRow
            description="Internet fibra 1 giga com TV e telefone da casa da praia e do escritório"
            detail="Todo ano em 15 de março · Conta Conjunta do Banco Exemplo · Casa › Internet, TV e telefone"
            next={{ label: 'Próxima 15/03/27', tone: 'neutral' }}
            art={HOME}
            amountCents={123456789}
            direction="out"
            isEstimate
          />
        </Card>
      ),
    },
  ],
}
