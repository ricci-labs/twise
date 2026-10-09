import type { ProgressBarProps } from '@web/components/charts/progress-bar/progress-bar.types'
import { progressBarVariants } from '@web/components/charts/progress-bar/progress-bar.variants'
import { cn } from '@web/lib/cn'

const FULL = 100

export function ProgressBar({ percent, markPercent, tone, className }: ProgressBarProps) {
  const width = `${Math.min(Math.max(percent, 0), FULL)}%`
  return (
    <svg
      data-slot="progress-bar"
      aria-hidden="true"
      className={cn('h-4 w-full overflow-visible', className)}
      preserveAspectRatio="none"
    >
      <rect x="0" y="4" width="100%" height="8" rx="4" className="fill-sunken" />
      <rect x="0" y="4" width={width} height="8" rx="4" className={progressBarVariants({ tone })} />
      {markPercent !== undefined && (
        <rect
          x={`${Math.min(markPercent, FULL)}%`}
          y="0"
          width="2"
          height="16"
          className="fill-ink"
        />
      )}
    </svg>
  )
}
