import { formatBrl } from '@financas/shared'
import { Link } from '@tanstack/react-router'
import { SegmentedControl } from '@web/components/actions/segmented-control'
import { TextLink } from '@web/components/actions/text-link'
import { ForecastChart } from '@web/components/charts/forecast-chart'
import { Card } from '@web/components/display/card'
import { homeMessages } from '@web/features/home/home.messages'
import type { ForecastCardProps } from '@web/features/home/home.types'
import { formatDayMonth, formatShortDate } from '@web/lib/format/calendar'
import { useState } from 'react'

const messages = homeMessages.forecast
const CENTS_PER_THOUSAND = 100_000
const CENTS_PER_REAL = 100

export function ForecastCard({ workspaceId, overview, nameOf, className }: ForecastCardProps) {
  const forecasts = overview.metrics.balanceForecast.filter(
    (forecast) => forecast.points.length > 1,
  )
  const [chosen, setChosen] = useState(forecasts[0]?.accountId ?? '')
  const forecast = forecasts.find((candidate) => candidate.accountId === chosen) ?? forecasts[0]
  if (!forecast) {
    return null
  }
  const account = nameOf(forecast.accountId)
  return (
    <Card
      id="forecast"
      className={className}
      title={messages.title}
      description={messages.description}
      headerAction={
        forecasts.length > 1 && (
          <SegmentedControl
            label={messages.account}
            value={forecast.accountId}
            onValueChange={setChosen}
            options={forecasts.map((candidate) => ({
              value: candidate.accountId,
              label: nameOf(candidate.accountId),
            }))}
          />
        )
      }
      footerStat={messages.today(
        formatBrl(forecast.startCents),
        formatBrl(forecast.endCents),
        formatShortDate(forecast.until),
      )}
      footerAction={
        <TextLink
          render={<Link to="/w/$workspaceId/$area" params={{ workspaceId, area: 'accounts' }} />}
        >
          {messages.seeAccounts}
        </TextLink>
      }
    >
      <ForecastChart
        points={forecast.points.map((point) => ({
          key: point.on,
          label: formatDayMonth(point.on),
          cents: point.balanceCents,
        }))}
        lowestKey={forecast.lowestOn}
        lowestLabel={messages.lowest(
          formatBrl(forecast.lowestCents),
          formatDayMonth(forecast.lowestOn),
        )}
        description={messages.alternative(
          account,
          formatBrl(forecast.startCents),
          formatBrl(forecast.endCents),
          formatBrl(forecast.lowestCents),
          formatDayMonth(forecast.lowestOn),
        )}
        formatAxis={axisLabel}
      />
    </Card>
  )
}

function axisLabel(cents: number): string {
  if (Math.abs(cents) >= CENTS_PER_THOUSAND) {
    return messages.thousands(Math.round(cents / CENTS_PER_THOUSAND))
  }
  return messages.reais(Math.round(cents / CENTS_PER_REAL))
}
