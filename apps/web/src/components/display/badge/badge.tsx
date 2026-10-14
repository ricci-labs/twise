import type { BadgeProps } from '@web/components/display/badge/badge.types'
import { badgeDotVariants, badgeVariants } from '@web/components/display/badge/badge.variants'
import { cn } from '@web/lib/cn'

export function Badge({ tone, size, hasDot = false, className, children }: BadgeProps) {
  return (
    <span data-slot="badge" className={cn(badgeVariants({ tone, size }), className)}>
      {hasDot && <span aria-hidden="true" className={badgeDotVariants()} />}
      {children}
    </span>
  )
}
