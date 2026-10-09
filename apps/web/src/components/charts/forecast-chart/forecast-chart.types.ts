export type ForecastPoint = {
  key: string
  label: string
  cents: number
}

export type ForecastChartProps = {
  points: readonly ForecastPoint[]
  lowestKey: string
  lowestLabel: string
  description: string
  formatAxis: (cents: number) => string
  className?: string
}

export type ForecastScale = {
  top: number
  bottom: number
  zeroOffset: string
}
