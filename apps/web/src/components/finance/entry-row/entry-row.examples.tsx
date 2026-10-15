import { EntryRow } from '@web/components/finance/entry-row/entry-row'
import type { ComponentExamples } from '@web/lib/examples.types'
import type { ReactNode } from 'react'

function Card({ children }: { children: ReactNode }) {
  return (
    <ul className="w-full max-w-100 rounded-xl border border-border bg-surface px-3">{children}</ul>
  )
}

export const entryRowExamples: ComponentExamples = {
  component: 'EntryRow',
  examples: [
    {
      name: 'Saída, parcelada, dividida e com comprovante',
      render: () => (
        <Card>
          <EntryRow
            description="Mercado da semana"
            detail="Mercado › Feira · Conta X"
            art={{ name: 'Mercado', icon: 'groceries' }}
            amountCents={8640}
            direction="out"
          />
          <EntryRow
            description="Tênis de corrida"
            detail="Lazer · Cartão X"
            art={{ name: 'Lazer', icon: 'leisure' }}
            amountCents={100000}
            direction="out"
            installmentCount={3}
          />
          <EntryRow
            description="Jantar de aniversário"
            detail="Lazer · Cartão X"
            art={{ name: 'Lazer', icon: 'leisure' }}
            amountCents={24000}
            direction="out"
            isShared
          />
          <EntryRow
            description="Corrida de aplicativo"
            detail="Transporte › Aplicativo · Conta Y · por Member B, que mora longe do trabalho"
            art={{ name: 'Transporte', icon: 'transport' }}
            amountCents={2390}
            direction="out"
            hasReceipt
          />
        </Card>
      ),
    },
    {
      name: 'Entrada e transferência',
      render: () => (
        <Card>
          <EntryRow
            description="Member C pagou o cinema"
            detail="Recebimento · Conta X"
            art={{ name: 'Recebimento', icon: 'settlement' }}
            amountCents={12000}
            direction="in"
          />
          <EntryRow
            description="Reserva"
            detail="Conta X › Poupança"
            art={{ name: 'Transferência', icon: 'transfer' }}
            amountCents={60000}
            direction="neutral"
          />
        </Card>
      ),
    },
    {
      name: 'Com a busca destacada',
      render: () => (
        <Card>
          <EntryRow
            description="Pão da manhã"
            detail="Mercado › Padaria · Conta X"
            art={{ name: 'Mercado', icon: 'groceries' }}
            amountCents={1250}
            direction="out"
            search="pao"
          />
        </Card>
      ),
    },
    {
      name: 'Texto longo no celular',
      render: () => (
        <ul className="w-80 rounded-xl border border-border bg-surface px-3">
          <EntryRow
            description="Internet fibra 1 giga com TV e telefone"
            detail="Casa › Internet · Conta Conjunta do Banco Exemplo · por Fulana de Tal dos Santos Silva"
            art={{ name: 'Casa', icon: 'house' }}
            amountCents={123456789}
            direction="out"
            installmentCount={12}
          />
        </ul>
      ),
    },
  ],
}
