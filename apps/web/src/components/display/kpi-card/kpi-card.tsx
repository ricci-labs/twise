import type { KpiBadgeProps, KpiCardProps } from '@web/components/display/kpi-card/kpi-card.types'
import {
  kpiBadgeVariants,
  kpiCardVariants,
} from '@web/components/display/kpi-card/kpi-card.variants'
import { cn } from '@web/lib/cn'

export function KpiCard({
  label,
  help,
  value,
  badge,
  art,
  tone,
  className,
  children,
}: KpiCardProps) {
  return (
    <article data-slot="kpi-card" className={cn(kpiCardVariants({ tone }), className)}>
      {art && <div className="pointer-events-none absolute right-3.5 bottom-3.5">{art}</div>}
      <div className="relative flex min-h-6.5 items-center gap-1.5">
        <h3 data-slot="kpi-label" className="text-label">
          {label}
        </h3>
        {help}
      </div>
      <p data-slot="kpi-value" className="relative">
        {value}
      </p>
      <div
        className={cn(
          'relative mt-auto flex flex-col items-start gap-1.5 text-body-sm',
          art && 'pr-20',
        )}
      >
        {badge}
        {children}
      </div>
    </article>
  )
}

export function KpiBadge({ tone, children }: KpiBadgeProps) {
  return (
    <span data-slot="kpi-badge" className={kpiBadgeVariants({ tone })}>
      {children}
    </span>
  )
}
