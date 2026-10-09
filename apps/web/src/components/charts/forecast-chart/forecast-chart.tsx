import type {
  ForecastChartProps,
  ForecastScale,
} from '@web/components/charts/forecast-chart/forecast-chart.types'
import { cn } from '@web/lib/cn'
import { useId } from 'react'
import {
  Area,
  AreaChart,
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

export function ForecastChart({
  points,
  lowestKey,
  lowestLabel,
  description,
  formatAxis,
  className,
}: ForecastChartProps) {
  const gradientId = `forecast-${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const lowest = points.find((point) => point.key === lowestKey)
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
            {lowest && (
              <ReferenceDot
                x={lowest.label}
                y={lowest.cents}
                r={5}
                fill="var(--color-surface)"
                stroke={lowest.cents < 0 ? NEGATIVE : LINE}
                strokeWidth={2}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {lowest && (
        <p className="self-start rounded-md border border-border bg-surface px-3 py-1.5 text-body-sm shadow-float">
          {lowestLabel}
        </p>
      )}
      <figcaption className="sr-only">{description}</figcaption>
    </figure>
  )
}

function scaleOf(values: readonly number[]): ForecastScale {
  const top = Math.max(0, ...values)
  const bottom = Math.min(0, ...values)
  const span = top - bottom || 1
  return { top, bottom, zeroOffset: `${(top / span) * 100}%` }
}
