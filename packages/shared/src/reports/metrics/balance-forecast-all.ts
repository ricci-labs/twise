import type { IsoDate } from '@shared/core/calendar/calendar.types'
import type { AccountKind } from '@shared/ledger/ledger/ledger.constants'
import {
  forecastOf,
  horizonOf,
  moneyAccounts,
  negativeStretch,
} from '@shared/reports/metrics/balance-forecast'
import { sumCents } from '@shared/reports/metrics/facts'
import type {
  BalanceForecast,
  BalanceForecastTotal,
  BalancePoint,
  PeriodFacts,
} from '@shared/reports/metrics/metrics.types'

const FEWEST_TO_ADD_UP = 2
const EVERYDAY_KINDS: ReadonlySet<AccountKind> = new Set(['checking', 'cash_wallet'])

export function balanceForecastAll(facts: PeriodFacts): BalanceForecastTotal | null {
  const accounts = moneyAccounts(facts).filter((account) => EVERYDAY_KINDS.has(account.kind))
  if (accounts.length < FEWEST_TO_ADD_UP) {
    return null
  }
  const until = accounts
    .map((account) => horizonOf(facts, account.id))
    .reduce((latest, date) => (date > latest ? date : latest))
  const series = accounts.map((account) => forecastOf(facts, account, until))
  const days = [...new Set(series.flatMap((forecast) => forecast.points.map((point) => point.on)))]
  const points: BalancePoint[] = days.sort().map((on) => ({
    on,
    balanceCents: sumCents(series.map((forecast) => balanceOn(forecast, on))),
  }))
  const lowest = points.reduce((low, point) =>
    point.balanceCents < low.balanceCents ? point : low,
  )
  return {
    until,
    startCents: sumCents(series.map((forecast) => forecast.startCents)),
    endCents: sumCents(series.map((forecast) => forecast.endCents)),
    lowestCents: lowest.balanceCents,
    lowestOn: lowest.on,
    ...negativeStretch(points, until),
    points,
  }
}

function balanceOn(forecast: BalanceForecast, on: IsoDate): number {
  const known = forecast.points.filter((point) => point.on <= on).at(-1)
  return known?.balanceCents ?? forecast.startCents
}
