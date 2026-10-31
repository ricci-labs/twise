import { todayIn } from '@financas/shared'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Button } from '@web/components/actions/button'
import { SectionSkeleton } from '@web/components/feedback/section-skeleton'
import { TwiseIcon } from '@web/components/icons/twise-icon'
import { PageFrame } from '@web/components/layout/page-frame'
import { PageHeader } from '@web/components/layout/page-header'
import { SubPageHeader } from '@web/components/layout/sub-page-header'
import { WorkScreen } from '@web/components/layout/work-screen'
import { Breadcrumb } from '@web/components/navigation/breadcrumb'
import {
  accountsQueryOptions,
  balancesQueryOptions,
  cardsQueryOptions,
} from '@web/features/purchase/api/purchase.queries'
import { PurchaseForm } from '@web/features/purchase/components/purchase-form'
import { PurchaseResult } from '@web/features/purchase/components/purchase-result'
import {
  fieldErrorsOf,
  firstDraftOf,
  namesOf,
  recordSearchOf,
  simulationQueryOf,
} from '@web/features/purchase/components/purchase-views'
import { useLiveSimulation } from '@web/features/purchase/hooks/use-live-simulation'
import { purchaseMessages as messages } from '@web/features/purchase/purchase.messages'
import type {
  PurchaseDraft,
  PurchasePageProps,
  PurchaseScreenProps,
} from '@web/features/purchase/purchase.types'
import { useMediaQuery } from '@web/hooks/use-media-query'
import { usePageTitle } from '@web/hooks/use-page-title'
import { DESKTOP_QUERY } from '@web/lib/breakpoints'
import { hasPermission } from '@web/lib/permissions'
import { Plus } from 'lucide-react'
import { useMemo, useState } from 'react'

const TIME_ZONE = 'America/Sao_Paulo'
const SKELETON_LINES = 6
const NO_QUERY = { amountCents: '0', installmentCount: '1' }

export function PurchasePage({ workspaceId, permissions }: PurchasePageProps) {
  usePageTitle(messages.pageTitle)
  const cards = useQuery(cardsQueryOptions(workspaceId))
  const accounts = useQuery(accountsQueryOptions(workspaceId))
  const balances = useQuery(balancesQueryOptions(workspaceId))
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  return (
    <PageFrame className="gap-4 lg:gap-6 lg:tall:h-screen-safe">
      {isDesktop ? (
        <div className="flex flex-col gap-3">
          <Breadcrumb
            label={messages.crumb}
            items={[
              {
                label: messages.back,
                link: <Link to="/w/$workspaceId" params={{ workspaceId }} />,
              },
              { label: messages.title },
            ]}
          />
          <PageHeader title={messages.title} description={messages.lead} />
        </div>
      ) : (
        <SubPageHeader
          back={<Link to="/w/$workspaceId" params={{ workspaceId }} />}
          backLabel={messages.back}
          title={messages.title}
          description={messages.lead}
        />
      )}
      {cards.data && accounts.data ? (
        <PurchaseScreen
          workspaceId={workspaceId}
          permissions={permissions}
          cards={cards.data}
          accounts={accounts.data}
          balances={balances.data ?? []}
          isDesktop={isDesktop}
        />
      ) : (
        <SectionSkeleton lines={SKELETON_LINES} />
      )}
    </PageFrame>
  )
}

function PurchaseScreen({
  workspaceId,
  permissions,
  cards,
  accounts,
  balances,
  isDesktop,
}: PurchaseScreenProps) {
  const today = todayIn(TIME_ZONE, new Date())
  const [draft, setDraft] = useState<PurchaseDraft>(() => firstDraftOf(cards, today))
  const live = useLiveSimulation(workspaceId, simulationQueryOf(draft))
  const names = useMemo(() => namesOf(draft, cards, accounts), [draft, cards, accounts])
  const errors = fieldErrorsOf(draft, live.isWaiting ? null : live.result.error)
  const record =
    live.query && hasPermission(permissions, 'entries', 'create') ? (
      <Button
        variant="secondary"
        width="full"
        render={
          <Link
            to="."
            search={(previous) => ({
              ...previous,
              ...recordSearchOf(draft, live.query ?? NO_QUERY),
            })}
          />
        }
      >
        <Plus aria-hidden="true" />
        {messages.record}
      </Button>
    ) : null
  const form = (
    <PurchaseForm
      workspaceId={workspaceId}
      draft={draft}
      errors={errors}
      today={today}
      cards={cards}
      accounts={accounts}
      balances={balances}
      onChange={(change) => setDraft((current) => ({ ...current, ...change }))}
    />
  )
  const result = (
    <PurchaseResult
      live={live}
      names={names}
      record={record}
      layout={isDesktop ? 'desktop' : 'phone'}
    />
  )
  if (isDesktop) {
    return (
      <WorkScreen
        columns="detail"
        listLabel={messages.form}
        listHeader={<h2 className="text-card-title">{messages.form}</h2>}
        list={form}
        detailLabel={messages.result}
        detailHeader={
          <>
            <h2 className="flex-1 text-card-title">{messages.result}</h2>
            <span className="flex items-center gap-1.5 text-note text-ink-muted">
              <TwiseIcon name="refresh" size="sm" />
              {messages.live}
            </span>
          </>
        }
        detail={<div aria-live="polite">{result}</div>}
      />
    )
  }
  return (
    <>
      <section
        aria-label={messages.form}
        className="rounded-lg border border-border bg-surface p-4"
      >
        {form}
      </section>
      <section aria-label={messages.result} aria-live="polite">
        {result}
      </section>
    </>
  )
}
