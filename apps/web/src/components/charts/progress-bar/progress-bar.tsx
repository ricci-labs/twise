import type { ProgressBarProps } from '@web/components/charts/progress-bar/progress-bar.types'
import {
  progressBarVariants,
  progressSvgVariants,
  progressTrackVariants,
} from '@web/components/charts/progress-bar/progress-bar.variants'
import { cn } from '@web/lib/cn'

const FULL = 100
const BARS = { md: { y: 4, height: 8 }, lg: { y: 0, height: 10 } } as const

export function ProgressBar({
  percent,
  markPercent,
  tone,
  thickness = 'md',
  className,
}: ProgressBarProps) {
  const width = `${Math.min(Math.max(percent, 0), FULL)}%`
  const bar = BARS[thickness]
  return (
    <svg
      data-slot="progress-bar"
      aria-hidden="true"
      className={cn(progressSvgVariants({ thickness }), className)}
      preserveAspectRatio="none"
    >
      <rect
        x="0"
        y={bar.y}
        width="100%"
        height={bar.height}
        rx={bar.height / 2}
        className={progressTrackVariants({ tone })}
      />
      <rect
        x="0"
        y={bar.y}
        width={width}
        height={bar.height}
        rx={bar.height / 2}
        className={progressBarVariants({ tone })}
      />
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
