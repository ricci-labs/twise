import type { PairedCardGridProps } from '@web/components/layout/paired-card-grid/paired-card-grid.types'
import { pairedCardGridVariants } from '@web/components/layout/paired-card-grid/paired-card-grid.variants'
import { cn } from '@web/lib/cn'

export function PairedCardGrid({ className, ...props }: PairedCardGridProps) {
  return (
    <div
      data-slot="paired-card-grid"
      className={cn(pairedCardGridVariants(), className)}
      {...props}
    />
  )
}
