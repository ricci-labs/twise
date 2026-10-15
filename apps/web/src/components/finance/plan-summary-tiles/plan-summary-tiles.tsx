import { Amount } from '@web/components/display/amount'
import { planSummaryTilesMessages as messages } from '@web/components/finance/plan-summary-tiles/plan-summary-tiles.messages'
import type {
  PlanSummaryTile,
  PlanSummaryTilesProps,
} from '@web/components/finance/plan-summary-tiles/plan-summary-tiles.types'
import {
  planSummaryLabelVariants,
  planSummaryNoteVariants,
  planSummaryTilesVariants,
  planSummaryTileVariants,
  planSummaryValueVariants,
} from '@web/components/finance/plan-summary-tiles/plan-summary-tiles.variants'

export function PlanSummaryTiles({ tiles, label }: PlanSummaryTilesProps) {
  return (
    <dl data-slot="plan-summary-tiles" aria-label={label} className={planSummaryTilesVariants()}>
      {tiles.map((tile) => (
        <Tile key={tile.label} {...tile} />
      ))}
    </dl>
  )
}

function Tile({ label, amountCents, tone, isEstimate = false, note }: PlanSummaryTile) {
  return (
    <div className={planSummaryTileVariants()}>
      <dt className={planSummaryLabelVariants()}>{label}</dt>
      <dd className={planSummaryValueVariants({ tone })}>
        {isEstimate && (
          <span title={messages.estimate}>
            ≈ <span className="sr-only">{messages.estimate}</span>
          </span>
        )}
        <Amount cents={amountCents} size="inherit" />
      </dd>
      {note && <dd className={planSummaryNoteVariants()}>{note}</dd>}
    </div>
  )
}
