import piggyBank from '@web/assets/illustrations/piggy-bank.svg'
import { Amount } from '@web/components/display/amount'
import { KpiBadge, KpiCard } from '@web/components/display/kpi-card/kpi-card'
import type { ComponentExamples } from '@web/lib/examples.types'

export const kpiCardExamples: ComponentExamples = {
  component: 'KpiCard',
  examples: [
    {
      name: 'Menta',
      render: () => (
        <KpiCard
          className="w-75"
          tone="mint"
          label="Livre para gastar"
          value={<Amount cents={234_000} size="kpi" isCentsRaised />}
          badge={<KpiBadge tone="onMint">R$ 146,25 por dia</KpiBadge>}
          art={<img src={piggyBank} alt="" className="size-17 rounded-full" />}
        >
          <p>Até 4 nov · faltam 16 dias</p>
        </KpiCard>
      ),
    },
    {
      name: 'Comum',
      render: () => (
        <KpiCard
          className="w-75"
          label="Gasto"
          value={<Amount cents={386_000} size="kpi" />}
          badge={<KpiBadge>43% da renda</KpiBadge>}
        >
          <p>Média mensal (3 meses): R$ 6.300,00</p>
        </KpiCard>
      ),
    },
    {
      name: 'Passou do planejado',
      render: () => (
        <KpiCard
          className="w-75"
          tone="danger"
          label="Livre para gastar"
          value={<Amount cents={-38_000} size="kpi" />}
          badge={<KpiBadge tone="danger">Passou do planejado</KpiBadge>}
        >
          <p>Os gastos e as contas passaram da renda.</p>
        </KpiCard>
      ),
    },
  ],
}
