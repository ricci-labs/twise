import { Button } from '@web/components/actions/button'
import { ComingMonthsBars } from '@web/components/charts/coming-months-bars'
import { BeforeAfterTiles } from '@web/components/display/before-after-tiles'
import { Card } from '@web/components/display/card'
import { CategoryArt } from '@web/components/display/category-art'
import { RichText } from '@web/components/display/rich-text'
import { Verdict } from '@web/components/display/verdict'
import { ResultState } from '@web/components/feedback/result-state'
import { SectionSkeleton } from '@web/components/feedback/section-skeleton'
import { TwiseIcon } from '@web/components/icons/twise-icon'
import {
  comingBarsOf,
  elsewhereNoteOf,
  insightSentenceOf,
  periodItemsOf,
  periodRangeOf,
  verdictOf,
} from '@web/features/purchase/components/purchase-views'
import { purchaseMessages as messages } from '@web/features/purchase/purchase.messages'
import type {
  PurchaseFailedProps,
  PurchaseResultProps,
  PurchaseShownProps,
} from '@web/features/purchase/purchase.types'
import { ApiError } from '@web/lib/api/api-error'
import { Info } from 'lucide-react'

const SKELETON_LINES = 4

export function PurchaseResult({ live, names }: PurchaseResultProps) {
  const { query, isWaiting, result } = live
  if (query === null && !isWaiting) {
    return (
      <ResultState
        frame="dashed"
        art={<CategoryArt name={messages.start.title} icon="wallet" size="hero" />}
        title={messages.start.title}
        text={messages.start.text}
      />
    )
  }
  if (result.isError && !isWaiting) {
    return <PurchaseFailed result={result} />
  }
  if (isWaiting || !result.data) {
    return (
      <div
        aria-busy="true"
        aria-label={messages.loading}
        className="flex flex-col gap-3"
        role="status"
      >
        <SectionSkeleton lines={1} />
        <SectionSkeleton lines={SKELETON_LINES} />
        <SectionSkeleton lines={SKELETON_LINES} />
      </div>
    )
  }
  return <PurchaseShown impact={result.data} names={names} />
}

function PurchaseFailed({ result }: PurchaseFailedProps) {
  const error = result.error instanceof ApiError ? result.error : null
  return (
    <ResultState
      isAlert
      tone="danger"
      art={<TwiseIcon name="alert" />}
      title={messages.failed.title}
      text={messages.failed.text}
      detail={error ? errorDetailOf(error) : undefined}
      action={
        <Button
          variant="secondary"
          isLoading={result.isFetching}
          onClick={() => void result.refetch()}
        >
          <TwiseIcon name="refresh" size="md" />
          {messages.failed.retry}
        </Button>
      }
    />
  )
}

function PurchaseShown({ impact, names }: PurchaseShownProps) {
  const verdict = verdictOf(impact)
  const note = elsewhereNoteOf(impact)
  const bars = comingBarsOf(impact)
  return (
    <div data-slot="purchase-result" className="flex flex-col gap-4">
      <Verdict
        tone={verdict.tone}
        title={verdict.title}
        text={<RichText text={verdict.reason.template} values={verdict.reason.values} />}
      />
      <Card
        title={messages.period.title}
        description={messages.period.description(periodRangeOf(impact))}
      >
        <BeforeAfterTiles items={periodItemsOf(impact, names)} layout="rows" />
        {note && <p className="mt-2 text-note text-ink-muted">{note}</p>}
      </Card>
      {bars.length > 0 && (
        <Card title={messages.coming.title} description={messages.coming.description}>
          <ComingMonthsBars months={bars} referencePercent={impact.committedReferencePercent} />
        </Card>
      )}
      <PurchaseInsights impact={impact} names={names} />
      <p className="flex items-center gap-2 text-note text-ink-muted">
        <Info aria-hidden="true" className="size-4 shrink-0" />
        {messages.simulationOnly}
      </p>
    </div>
  )
}

function PurchaseInsights({ impact, names }: PurchaseShownProps) {
  const sentences = impact.newInsights.flatMap((insight) => {
    const sentence = insightSentenceOf(insight, names)
    return sentence ? [{ key: `${insight.code}-${insight.subject}`, insight, sentence }] : []
  })
  return (
    <section aria-label={messages.insights.title} className="flex flex-col gap-2.5">
      <h2 className="text-title-sm">{messages.insights.title}</h2>
      {sentences.length === 0 ? (
        <p className="rounded-lg border border-border bg-surface px-4 py-3.5 text-body-sm text-ink-muted">
          {messages.insights.none}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {sentences.map(({ key, insight, sentence }) => (
            <li
              key={key}
              className="flex items-start gap-3 rounded-lg border border-border bg-surface px-4 py-3.5"
            >
              <TwiseIcon
                name={insight.severity === 'alert' ? 'alert' : 'warn'}
                tone={insight.severity === 'alert' ? 'danger' : 'warning'}
              />
              <p className="text-body">
                <RichText text={sentence.template} values={sentence.values} />
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function errorDetailOf(error: ApiError): string {
  const reference = error.ref ? [messages.failed.reference(error.ref)] : []
  return [messages.failed.code(error.code), ...reference].join(' · ')
}
