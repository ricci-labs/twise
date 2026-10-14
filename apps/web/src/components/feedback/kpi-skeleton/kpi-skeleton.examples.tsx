import { KpiSkeleton } from '@web/components/feedback/kpi-skeleton/kpi-skeleton'
import type { ComponentExamples } from '@web/lib/examples.types'

export const kpiSkeletonExamples: ComponentExamples = {
  component: 'KpiSkeleton',
  examples: [{ name: 'Um indicador carregando', render: () => <KpiSkeleton /> }],
}
