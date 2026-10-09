import type {
  ForecastCalloutProps,
  ForecastChartProps,
  ForecastScale,
} from '@web/components/charts/forecast-chart/forecast-chart.types'
import { cn } from '@web/lib/cn'
import { useId } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'

const LINE = 'var(--color-mint-ink)'
const FILL = 'var(--color-mint)'
const NEGATIVE = 'var(--color-danger)'
const AXIS = { fontSize: 12, fill: 'var(--color-ink-muted)' }
const CHART_HEIGHT = 330
const CALLOUT_WIDTH = 220
const CALLOUT_HEIGHT = 56
const CALLOUT_GAP = 10
const FLIP_AFTER = 0.55

export function ForecastChart({
  points,
  lowestKey,
  lowestCallout,
  description,
  formatAxis,
  className,
}: ForecastChartProps) {
  const gradientId = `forecast-${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const lowestIndex = points.findIndex((point) => point.key === lowestKey)
  const lowest = points[lowestIndex]
  const side = lowestIndex > (points.length - 1) * FLIP_AFTER ? 'left' : 'right'
  const scale = scaleOf(points.map((point) => point.cents))
  return (
    <figure data-slot="forecast-chart" className={cn('flex w-full flex-col gap-2', className)}>
      <div aria-hidden="true">
        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
          <AreaChart
            accessibilityLayer={false}
            data={[...points]}
            margin={{ top: 12, right: 12, bottom: 0, left: 0 }}
          >
            <defs>
              <linearGradient id={`${gradientId}-stroke`} x1="0" y1="0" x2="0" y2="1">
                <stop offset={scale.zeroOffset} stopColor={LINE} />
                <stop offset={scale.zeroOffset} stopColor={NEGATIVE} />
              </linearGradient>
              <linearGradient id={`${gradientId}-fill`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={FILL} stopOpacity={0.55} />
                <stop offset={scale.zeroOffset} stopColor={FILL} stopOpacity={0.08} />
                <stop offset={scale.zeroOffset} stopColor={NEGATIVE} stopOpacity={0.18} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--color-border)" />
            <XAxis
              dataKey="label"
              tick={AXIS}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              minTickGap={24}
            />
            <YAxis
              tick={AXIS}
              tickLine={false}
              axisLine={false}
              width={80}
              domain={[scale.bottom, scale.top]}
              tickFormatter={formatAxis}
            />
            <ReferenceLine y={0} stroke="var(--color-border-control)" strokeDasharray="4 4" />
            <Area
              type="stepAfter"
              dataKey="cents"
              stroke={scale.bottom < 0 ? `url(#${gradientId}-stroke)` : LINE}
              strokeWidth={2}
              fill={`url(#${gradientId}-fill)`}
              isAnimationActive={false}
            />
            {lowest && <ReferenceLine x={lowest.label} stroke="var(--color-border-control)" />}
            {lowest && (
              <ReferenceDot
                x={lowest.label}
                y={lowest.cents}
                r={5}
                fill="var(--color-surface)"
                stroke={lowest.cents < 0 ? NEGATIVE : LINE}
                strokeWidth={2}
                label={<LowestCallout callout={lowestCallout} side={side} />}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <figcaption className="sr-only">{description}</figcaption>
    </figure>
  )
}

function LowestCallout({ viewBox, callout, side }: ForecastCalloutProps) {
  const x = viewBox?.x ?? 0
  const y = viewBox?.y ?? 0
  return (
    <foreignObject
      x={side === 'right' ? x + CALLOUT_GAP : x - CALLOUT_WIDTH - CALLOUT_GAP}
      y={Math.max(y - CALLOUT_HEIGHT - CALLOUT_GAP, 0)}
      width={CALLOUT_WIDTH}
      height={CALLOUT_HEIGHT}
      overflow="visible"
    >
      <div
        data-slot="forecast-callout"
        className={cn('flex h-full items-end', side === 'left' && 'justify-end')}
      >
        <p className="flex flex-col rounded-md border border-border bg-surface px-3 py-1.5 shadow-float">
          <span className="text-amount-sm">{callout.amount}</span>
          <span className="text-caption whitespace-nowrap text-ink-muted">{callout.detail}</span>
        </p>
      </div>
    </foreignObject>
  )
}

function scaleOf(values: readonly number[]): ForecastScale {
  const top = Math.max(0, ...values)
  const bottom = Math.min(0, ...values)
  const span = top - bottom || 1
  return { top, bottom, zeroOffset: `${(top / span) * 100}%` }
}
