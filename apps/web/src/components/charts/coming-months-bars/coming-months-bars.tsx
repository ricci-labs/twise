import { comingMonthsBarsMessages as messages } from '@web/components/charts/coming-months-bars/coming-months-bars.messages'
import type {
  ComingMonthRowProps,
  ComingMonthsBarsProps,
} from '@web/components/charts/coming-months-bars/coming-months-bars.types'
import {
  comingMonthAfterVariants,
  comingMonthBeforeVariants,
  comingMonthLabelVariants,
  comingMonthOverVariants,
  comingMonthRowVariants,
  comingMonthSvgVariants,
  comingMonthsBarsVariants,
  comingMonthsLegendVariants,
  comingMonthsSwatchVariants,
  comingMonthTrackVariants,
  comingMonthValueVariants,
} from '@web/components/charts/coming-months-bars/coming-months-bars.variants'
import { Play } from 'lucide-react'

const FULL = 100
const GAP = 0.6
const BAR = { y: 4, height: 12, radius: 6, pieceRadius: 2 } as const
const MARK = { y: 0, height: 20, width: 2 } as const

export function ComingMonthsBars({ months, referencePercent }: ComingMonthsBarsProps) {
  return (
    <div data-slot="coming-months-bars" className={comingMonthsBarsVariants()}>
      <ul aria-hidden="true" className={comingMonthsLegendVariants()}>
        <li className="flex items-center gap-1.5">
          <span className={comingMonthsSwatchVariants({ kind: 'committed' })} />
          {messages.committed}
        </li>
        <li className="flex items-center gap-1.5">
          <span className={comingMonthsSwatchVariants({ kind: 'purchase' })} />
          {messages.purchase}
        </li>
        <li className="flex items-center gap-1.5">
          <span className={comingMonthsSwatchVariants({ kind: 'reference' })} />
          {messages.reference(referencePercent)}
        </li>
      </ul>
      <ul className="flex flex-col gap-2.5">
        {months.map((month) => (
          <ComingMonthRow key={month.key} month={month} referencePercent={referencePercent} />
        ))}
      </ul>
    </div>
  )
}

function ComingMonthRow({ month, referencePercent }: ComingMonthRowProps) {
  const isChanged = month.afterPercent !== month.beforePercent
  const before = clamp(month.beforePercent)
  const after = clamp(month.afterPercent)
  const added = Math.max(after - before - GAP, 0)
  const label = isChanged
    ? messages.changed(month.label, month.beforePercent, month.afterPercent)
    : messages.unchanged(month.label, month.beforePercent)
  return (
    <li data-changed={isChanged ? '' : undefined} className={comingMonthRowVariants()}>
      <span aria-hidden="true" className={comingMonthLabelVariants({ isChanged })}>
        {month.label}
      </span>
      <span role="img" aria-label={label} className={comingMonthTrackVariants()}>
        <svg aria-hidden="true" className={comingMonthSvgVariants()} preserveAspectRatio="none">
          <rect
            x="0"
            y={BAR.y}
            width="100%"
            height={BAR.height}
            rx={BAR.radius}
            className="fill-sunken"
          />
          <rect
            x="0"
            y={BAR.y}
            width={`${before}%`}
            height={BAR.height}
            rx={BAR.radius}
            className={comingMonthBeforeVariants({ isChanged })}
          />
          {isChanged && added > 0 && (
            <rect
              data-slot="coming-month-purchase"
              x={`${before + GAP}%`}
              y={BAR.y}
              width={`${added}%`}
              height={BAR.height}
              rx={BAR.pieceRadius}
              className="fill-chart-3"
            />
          )}
          <rect
            x={`${clamp(referencePercent)}%`}
            y={MARK.y}
            width={MARK.width}
            height={MARK.height}
            className="fill-warning"
          />
        </svg>
        {month.afterPercent > FULL && (
          <Play aria-label={messages.over} className={comingMonthOverVariants()} />
        )}
      </span>
      <span aria-hidden="true" className={comingMonthValueVariants({ isChanged })}>
        {isChanged ? (
          <>
            {messages.percent(month.beforePercent)}
            {messages.arrow}
            <b
              className={comingMonthAfterVariants({
                isHigh: month.afterPercent >= referencePercent,
              })}
            >
              {messages.percent(month.afterPercent)}
            </b>
          </>
        ) : (
          messages.percent(month.beforePercent)
        )}
      </span>
    </li>
  )
}

function clamp(percent: number): number {
  return Math.min(Math.max(percent, 0), FULL)
}
