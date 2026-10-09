import type { EmptyStateProps } from '@web/components/feedback/empty-state/empty-state.types'
import {
  emptyStateArtVariants,
  emptyStateVariants,
} from '@web/components/feedback/empty-state/empty-state.variants'
import { cn } from '@web/lib/cn'

export function EmptyState({ illustration, children, action, className }: EmptyStateProps) {
  return (
    <div data-slot="empty-state" className={cn(emptyStateVariants(), className)}>
      {illustration && <img src={illustration} alt="" className={emptyStateArtVariants()} />}
      <div className="flex flex-col items-start gap-1">
        <p>{children}</p>
        {action}
      </div>
    </div>
  )
}
