import { todayIn } from '@financas/shared'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Button } from '@web/components/actions/button'
import { SectionSkeleton } from '@web/components/feedback/section-skeleton'
import { PageFrame } from '@web/components/layout/page-frame'
import { SubPageHeader } from '@web/components/layout/sub-page-header'
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
import { usePageTitle } from '@web/hooks/use-page-title'
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
  return (
    <PageFrame className="gap-4">
      <SubPageHeader
        back={<Link to="/w/$workspaceId" params={{ workspaceId }} />}
        backLabel={messages.back}
        title={messages.title}
        description={messages.lead}
      />
      {cards.data && accounts.data ? (
        <PurchaseScreen
          workspaceId={workspaceId}
          permissions={permissions}
          cards={cards.data}
          accounts={accounts.data}
          balances={balances.data ?? []}
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
  return (
    <>
      <section
        aria-label={messages.form}
        className="rounded-lg border border-border bg-surface p-4"
      >
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
      </section>
      <section aria-label={messages.result} aria-live="polite">
        <PurchaseResult live={live} names={names} record={record} />
      </section>
    </>
  )
}
