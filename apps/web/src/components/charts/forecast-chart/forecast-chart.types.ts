export type ForecastPoint = {
  key: string
  label: string
  cents: number
}

export type ForecastChartProps = {
  points: readonly ForecastPoint[]
  lowestKey: string
  lowestCallout: ForecastCallout
  description: string
  formatAxis: (cents: number) => string
  className?: string
}

export type ForecastScale = {
  top: number
  bottom: number
  zeroOffset: string
}

export type ForecastCallout = {
  amount: string
  detail: string
}

export type ForecastCalloutProps = {
  viewBox?: { x?: number; y?: number }
  callout: ForecastCallout
  side: 'left' | 'right'
}
