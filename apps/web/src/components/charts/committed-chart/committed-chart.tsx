import type {
  CommittedChartProps,
  MonthTickProps,
} from '@web/components/charts/committed-chart/committed-chart.types'
import { cn } from '@web/lib/cn'
import {
  Bar,
  BarChart,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'

const INSTALLMENTS = 'var(--color-chart-4)'
const PLANNED = 'var(--color-chart-2)'
const WARNING = 'var(--color-warning)'
const AXIS = { fontSize: 12, fill: 'var(--color-ink-muted)' }
const TICKS = [0, 25, 50, 75, 100]
const CHART_HEIGHT = 260

export function CommittedChart({
  months,
  limitPercent,
  limitLabel,
  installmentsLabel,
  plannedLabel,
  description,
  className,
}: CommittedChartProps) {
  const highLabels = new Set(months.filter((month) => month.isHigh).map((month) => month.label))
  return (
    <figure data-slot="committed-chart" className={cn('flex w-full flex-col gap-3', className)}>
      <ul className="flex flex-wrap gap-4 text-body-sm text-ink-muted" aria-hidden="true">
        <li className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-chart-4" />
          {installmentsLabel}
        </li>
        <li className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-chart-2" />
          {plannedLabel}
        </li>
      </ul>
      <div aria-hidden="true">
        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
          <BarChart
            accessibilityLayer={false}
            data={[...months]}
            margin={{ top: 24, right: 8, bottom: 0, left: 0 }}
          >
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              interval={0}
              tick={(tick) => <MonthTick {...tick} highLabels={highLabels} />}
            />
            <YAxis
              tick={AXIS}
              tickLine={false}
              axisLine={false}
              width={44}
              domain={[0, 100]}
              ticks={TICKS}
              tickFormatter={(value: number) => `${value}%`}
              allowDataOverflow
            />
            <ReferenceLine
              y={limitPercent}
              stroke={WARNING}
              strokeDasharray="4 4"
              label={{
                value: limitLabel,
                position: 'insideBottomRight',
                className: 'fill-warning text-caption',
              }}
            />
            <Bar
              dataKey="installmentsPercent"
              stackId="committed"
              fill={INSTALLMENTS}
              maxBarSize={36}
            />
            <Bar
              dataKey="plannedPercent"
              stackId="committed"
              fill={PLANNED}
              maxBarSize={36}
              radius={[6, 6, 0, 0]}
            >
              <LabelList
                dataKey="percentLabel"
                position="top"
                className="fill-ink text-caption font-semibold"
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <figcaption className="sr-only">{description}</figcaption>
    </figure>
  )
}

function MonthTick({ x, y, payload, highLabels }: MonthTickProps) {
  const label = String(payload.value)
  const isHigh = highLabels.has(label)
  return (
    <text
      x={x}
      y={y}
      dy={14}
      textAnchor="middle"
      className={isHigh ? 'fill-warning text-caption font-semibold' : 'fill-ink-muted text-caption'}
    >
      {label}
    </text>
  )
}
