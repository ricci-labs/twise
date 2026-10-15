export type ShareRow = {
  key: string
  name: string
  amountCents: number
}

export type ShareRowsProps = {
  shares: readonly ShareRow[]
  ownCents: number
  ownLabel?: string
  note?: string
}
