export type NextDate = {
  key: string
  date: string
  weekday: string
  amountCents: number
  isEstimate?: boolean
  note?: string
}

export type NextDatesPreviewProps = {
  dates: readonly NextDate[]
  title?: string
  empty?: string
}
