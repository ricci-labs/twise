import { kpiSkeletonMessages as messages } from '@web/components/feedback/kpi-skeleton/kpi-skeleton.messages'
import {
  kpiSkeletonBlockVariants,
  kpiSkeletonVariants,
} from '@web/components/feedback/kpi-skeleton/kpi-skeleton.variants'

export function KpiSkeleton() {
  return (
    <div data-slot="kpi-skeleton" role="status" aria-busy="true" className={kpiSkeletonVariants()}>
      <span aria-hidden="true" className={kpiSkeletonBlockVariants({ shape: 'label' })} />
      <span aria-hidden="true" className={kpiSkeletonBlockVariants({ shape: 'value' })} />
      <span className="sr-only">{messages.loading}</span>
    </div>
  )
}
