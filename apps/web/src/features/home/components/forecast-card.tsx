import { formatBrl } from '@financas/shared'
import { Link } from '@tanstack/react-router'
import { SegmentedControl } from '@web/components/actions/segmented-control'
import { TextLink } from '@web/components/actions/text-link'
import { ForecastChart } from '@web/components/charts/forecast-chart'
import { Card } from '@web/components/display/card'
import { ResponsiveText } from '@web/components/display/responsive-text'
import { RichText } from '@web/components/display/rich-text'
import { homeMessages } from '@web/features/home/home.messages'
import type { ForecastCardProps } from '@web/features/home/home.types'
import { formatDayMonth, formatShortDate } from '@web/lib/format/calendar'
import { Info } from 'lucide-react'
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
      description={<ResponsiveText short={messages.descriptionShort} long={messages.description} />}
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
      footerStat={
        <span className="inline-flex items-center gap-1.5">
          <Info className="size-4 shrink-0" aria-hidden="true" />
          <span>
            <RichText
              text={messages.today}
              values={{
                start: formatBrl(forecast.startCents),
                end: formatBrl(forecast.endCents),
                until: formatShortDate(forecast.until),
              }}
            />
          </span>
        </span>
      }
      footerAction={
        <TextLink
          className="hidden lg:inline-flex"
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
        lowestCallout={{
          amount: formatBrl(forecast.lowestCents),
          detail: messages.lowestDetail(formatDayMonth(forecast.lowestOn)),
        }}
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
