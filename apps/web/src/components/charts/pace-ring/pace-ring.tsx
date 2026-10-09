import type { PaceRingProps, RingArcProps } from '@web/components/charts/pace-ring/pace-ring.types'
import { cn } from '@web/lib/cn'

const SIZE = 164
const CENTER = SIZE / 2
const OUTER = 72
const INNER = 56
const STROKE = 12
const FULL = 100

export function PaceRing({
  usedPercent,
  elapsedPercent,
  centerLabel,
  centerCaption,
  description,
  className,
}: PaceRingProps) {
  return (
    <figure data-slot="pace-ring" className={cn('relative mx-auto size-41', className)}>
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="size-full -rotate-90" aria-hidden="true">
        <circle
          cx={CENTER}
          cy={CENTER}
          r={OUTER}
          className="fill-none stroke-sunken"
          strokeWidth={STROKE}
        />
        <circle
          cx={CENTER}
          cy={CENTER}
          r={INNER}
          className="fill-none stroke-sunken"
          strokeWidth={STROKE}
        />
        <RingArc radius={OUTER} percent={usedPercent} className="stroke-chart-2" />
        <RingArc radius={INNER} percent={elapsedPercent} className="stroke-ink-muted" />
      </svg>
      <figcaption className="absolute inset-0 flex flex-col items-center justify-center">
        <span aria-hidden="true" className="font-display text-amount-kpi">
          {centerLabel}
        </span>
        <span aria-hidden="true" className="text-body-sm text-ink-muted">
          {centerCaption}
        </span>
        <span className="sr-only">{description}</span>
      </figcaption>
    </figure>
  )
}

function RingArc({ radius, percent, className }: RingArcProps) {
  const length = 2 * Math.PI * radius
  const filled = (Math.min(Math.max(percent, 0), FULL) / FULL) * length
  return (
    <circle
      cx={CENTER}
      cy={CENTER}
      r={radius}
      strokeWidth={STROKE}
      strokeLinecap="round"
      strokeDasharray={`${filled} ${length}`}
      className={cn('fill-none transition-all duration-slow ease-emphasized', className)}
    />
  )
}
