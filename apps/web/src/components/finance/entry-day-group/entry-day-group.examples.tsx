import { EntryDayGroup } from '@web/components/finance/entry-day-group/entry-day-group'
import { EntryRow } from '@web/components/finance/entry-row/entry-row'
import type { ComponentExamples } from '@web/lib/examples.types'

export const entryDayGroupExamples: ComponentExamples = {
  component: 'EntryDayGroup',
  examples: [
    {
      name: 'Hoje, com dois lançamentos',
      render: () => (
        <div className="w-full max-w-100">
          <EntryDayGroup title="Hoje" detail="ter, 20 out">
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
          </EntryDayGroup>
        </div>
      ),
    },
    {
      name: 'Um dia passado',
      render: () => (
        <div className="w-full max-w-100">
          <EntryDayGroup title="sáb, 17 out">
            <EntryRow
              description="Member C pagou o cinema"
              detail="Recebimento · Conta X"
              art={{ name: 'Recebimento', icon: 'settlement' }}
              amountCents={12000}
              direction="in"
            />
          </EntryDayGroup>
        </div>
      ),
    },
  ],
}
