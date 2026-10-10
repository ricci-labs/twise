import { formatBrl } from '@financas/shared'
import { Link } from '@tanstack/react-router'
import { SegmentedControl } from '@web/components/actions/segmented-control'
import { TextLink } from '@web/components/actions/text-link'
import { ForecastChart } from '@web/components/charts/forecast-chart'
import { Card } from '@web/components/display/card'
import { ResponsiveText } from '@web/components/display/responsive-text'
import { RichText } from '@web/components/display/rich-text'
import { TwiseIcon } from '@web/components/icons/twise-icon'
import { homeMessages } from '@web/features/home/home.messages'
import type {
  ForecastCardProps,
  ForecastSeries,
  NameLookup,
  Overview,
} from '@web/features/home/home.types'
import { formatDayMonth, formatShortDate } from '@web/lib/format/calendar'
import { Info } from 'lucide-react'
import { useState } from 'react'

const messages = homeMessages.forecast
const CENTS_PER_THOUSAND = 100_000
const CENTS_PER_REAL = 100
const ALL = 'all'

function seriesOf(overview: Overview, nameOf: NameLookup): ForecastSeries[] {
  const accounts = overview.metrics.balanceForecast
    .filter((forecast) => forecast.points.length > 1)
    .map((forecast) => ({ key: forecast.accountId, label: nameOf(forecast.accountId), forecast }))
  const all = overview.metrics.balanceForecastAll
  if (accounts.length < 2 || !all || all.points.length < 2) {
    return accounts
  }
  return [...accounts, { key: ALL, label: messages.all, forecast: all }]
}

export function ForecastCard({ workspaceId, overview, nameOf, className }: ForecastCardProps) {
  const series = seriesOf(overview, nameOf)
  const [chosen, setChosen] = useState(series[0]?.key ?? '')
  const current = series.find((candidate) => candidate.key === chosen) ?? series[0]
  if (!current) {
    return null
  }
  const { forecast, label: account } = current
  return (
    <Card
      id="forecast"
      className={className}
      title={messages.title}
      description={<ResponsiveText short={messages.descriptionShort} long={messages.description} />}
      headerAction={
        series.length > 1 && (
          <SegmentedControl
            label={messages.account}
            value={current.key}
            onValueChange={setChosen}
            options={series.map((candidate) => ({ value: candidate.key, label: candidate.label }))}
          />
        )
      }
      footerStat={
        forecast.negativeFrom && forecast.negativeUntil ? (
          <span className="inline-flex items-center gap-1.5 font-semibold text-danger">
            <TwiseIcon name="alert" tone="danger" size="sm" />
            {current.key === ALL
              ? messages.negativeAll(
                  formatShortDate(forecast.negativeFrom),
                  formatShortDate(forecast.negativeUntil),
                )
              : messages.negative(
                  account,
                  formatShortDate(forecast.negativeFrom),
                  formatShortDate(forecast.negativeUntil),
                )}
          </span>
        ) : (
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
        )
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
