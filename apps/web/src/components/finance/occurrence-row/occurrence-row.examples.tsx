import { OccurrenceRow } from '@web/components/finance/occurrence-row/occurrence-row'
import type { ComponentExamples } from '@web/lib/examples.types'
import type { ReactNode } from 'react'

function Card({ children }: { children: ReactNode }) {
  return (
    <ul className="w-full max-w-100 rounded-xl border border-border bg-surface px-3">{children}</ul>
  )
}

function noop() {}

export const occurrenceRowExamples: ComponentExamples = {
  component: 'OccurrenceRow',
  examples: [
    {
      name: 'Atrasado, com o Registrar compacto',
      render: () => (
        <Card>
          <OccurrenceRow
            dueOn="2026-10-18"
            description="Internet"
            detail="Conta X · Casa › Internet"
            badge="overdue"
            amountCents={12000}
            direction="out"
            isOverdue
            register={{ label: 'Registrar pagamento de Internet', onPress: noop }}
          />
        </Card>
      ),
    },
    {
      name: 'A vencer: hoje, aproximado e receita',
      render: () => (
        <Card>
          <OccurrenceRow
            dueOn="2026-10-20"
            description="Celular"
            detail="Cartão X · Casa"
            badge="today"
            amountCents={6990}
            direction="out"
          />
          <OccurrenceRow
            dueOn="2026-10-22"
            description="Luz"
            detail="Conta Y · Casa › Luz e água"
            amountCents={18000}
            direction="out"
            isEstimate
          />
          <OccurrenceRow
            dueOn="2026-11-03"
            description="Vale-alimentação"
            detail="Conta Y · Benefícios"
            amountCents={80000}
            direction="in"
          />
        </Card>
      ),
    },
    {
      name: 'Pagos, recebidos e pulados, em cinza',
      render: () => (
        <Card>
          <OccurrenceRow
            dueOn="2026-10-16"
            description="Diarista"
            detail="Conta Y · pago em 16/10"
            badge="paid"
            amountCents={18000}
            direction="out"
            isDone
          />
          <OccurrenceRow
            dueOn="2026-10-10"
            description="Comissão"
            detail="Conta X · recebido em 10/10 (previsto ≈ R$ 2.000,00)"
            badge="received"
            amountCents={280000}
            direction="in"
            isDone
          />
          <OccurrenceRow
            dueOn="2026-10-30"
            description="Diarista"
            detail="Conta Y · pulado por Member A"
            badge="skipped"
            amountCents={18000}
            direction="out"
            isDone
          />
        </Card>
      ),
    },
    {
      name: 'Texto longo e valor de 7 dígitos',
      render: () => (
        <Card>
          <OccurrenceRow
            dueOn="2026-10-18"
            description="Internet fibra 1 giga com TV e telefone da casa da praia e do escritório"
            detail="Conta Conjunta do Banco Exemplo · Casa › Internet, TV e telefone fixo da casa"
            badge="overdue"
            amountCents={123456789}
            direction="out"
            isOverdue
            register={{ label: 'Registrar pagamento de Internet', onPress: noop }}
          />
          <OccurrenceRow
            dueOn="2026-10-22"
            description="Internet fibra 1 giga com TV e telefone da casa da praia e do escritório"
            detail="Conta Conjunta do Banco Exemplo · Casa › Internet, TV e telefone fixo da casa"
            badge="today"
            amountCents={123456789}
            direction="out"
            isEstimate
          />
        </Card>
      ),
    },
  ],
}
