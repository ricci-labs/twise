export type ComingMonthBar = {
  key: string
  label: string
  beforePercent: number
  afterPercent: number
}

export type ComingMonthsBarsProps = {
  months: readonly ComingMonthBar[]
  referencePercent: number
}

export type ComingMonthRowProps = {
  month: ComingMonthBar
  referencePercent: number
}
