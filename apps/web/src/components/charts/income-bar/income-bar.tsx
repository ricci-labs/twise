import type { IncomeBarProps } from '@web/components/charts/income-bar/income-bar.types'
import {
  incomeBarDotVariants,
  incomeBarSegmentVariants,
} from '@web/components/charts/income-bar/income-bar.variants'
import { cn } from '@web/lib/cn'

const GAP = 0.6

export function IncomeBar({ segments, className }: IncomeBarProps) {
  const drawn = segments.filter((segment) => segment.percent > 0)
  const starts = drawn.map((_, position) =>
    drawn.slice(0, position).reduce((sum, segment) => sum + segment.percent, 0),
  )
  return (
    <div data-slot="income-bar" className={cn('flex flex-col gap-4', className)}>
      <svg aria-hidden="true" className="h-5 w-full" preserveAspectRatio="none">
        {drawn.map((segment, position) => (
          <rect
            key={segment.key}
            x={`${(starts[position] ?? 0) + (position > 0 ? GAP / 2 : 0)}%`}
            y="0"
            width={`${Math.max(segment.percent - GAP, 0)}%`}
            height="20"
            rx="5"
            className={incomeBarSegmentVariants({ tone: segment.tone })}
          />
        ))}
      </svg>
      <dl className="flex flex-col gap-1.5">
        {segments.map((segment) => (
          <div key={segment.key} className="flex items-center gap-2.5 text-body tabular-nums">
            <span aria-hidden="true" className={incomeBarDotVariants({ tone: segment.tone })} />
            <dt className="flex-1">{segment.label}</dt>
            <dd className="w-12 text-right font-semibold">{segment.percentLabel}</dd>
            <dd className="w-28 text-right text-ink-muted">{segment.amountLabel}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
