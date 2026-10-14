import type { BadgeProps } from '@web/components/display/badge/badge.types'
import { badgeVariants } from '@web/components/display/badge/badge.variants'
import { cn } from '@web/lib/cn'

export function Badge({ tone, size, className, children }: BadgeProps) {
  return (
    <span data-slot="badge" className={cn(badgeVariants({ tone, size }), className)}>
      {children}
    </span>
  )
}
