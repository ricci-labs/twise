import type { ActionGridProps } from '@web/components/actions/action-grid/action-grid.types'
import {
  actionGridFrameVariants,
  actionGridVariants,
} from '@web/components/actions/action-grid/action-grid.variants'
import { cn } from '@web/lib/cn'

export function ActionGrid({ layout, label, className, children }: ActionGridProps) {
  return (
    <div data-slot="action-grid" className={cn(actionGridFrameVariants(), className)}>
      <fieldset aria-label={label} className={actionGridVariants({ layout })}>
        {children}
      </fieldset>
    </div>
  )
}
