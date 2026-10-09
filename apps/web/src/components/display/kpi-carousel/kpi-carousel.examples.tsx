import { Amount } from '@web/components/display/amount'
import { KpiCard } from '@web/components/display/kpi-card'
import { KpiCarousel } from '@web/components/display/kpi-carousel/kpi-carousel'
import type { ComponentExamples } from '@web/lib/examples.types'

export const kpiCarouselExamples: ComponentExamples = {
  component: 'KpiCarousel',
  examples: [
    {
      name: 'Quatro indicadores',
      render: () => (
        <KpiCarousel>
          {[
            <KpiCard
              key="free"
              tone="mint"
              label="Livre para gastar"
              value={<Amount cents={234_000} size="kpi" isCentsRaised />}
            />,
            <KpiCard
              key="income"
              label="Renda do orçamento"
              value={<Amount cents={900_000} size="kpi" />}
            />,
            <KpiCard key="spent" label="Gasto" value={<Amount cents={386_000} size="kpi" />} />,
            <KpiCard
              key="committed"
              label="Comprometido"
              value={<Amount cents={280_000} size="kpi" />}
            />,
          ]}
        </KpiCarousel>
      ),
    },
  ],
}
