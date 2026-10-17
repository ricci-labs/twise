export type PlanSummaryTile = {
  label: string
  amountCents: number
  tone?: 'neutral' | 'income' | 'danger'
  isEstimate?: boolean
  note?: string
}

export type PlanSummaryTilesProps = {
  tiles: readonly [PlanSummaryTile, PlanSummaryTile]
  label: string
}
