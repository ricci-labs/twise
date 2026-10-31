import { todayIn } from '@financas/shared'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
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
  firstDraftOf,
  namesOf,
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
import { useMemo, useState } from 'react'

const TIME_ZONE = 'America/Sao_Paulo'
const SKELETON_LINES = 6

export function PurchasePage({ workspaceId }: PurchasePageProps) {
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

function PurchaseScreen({ workspaceId, cards, accounts, balances }: PurchaseScreenProps) {
  const today = todayIn(TIME_ZONE, new Date())
  const [draft, setDraft] = useState<PurchaseDraft>(() => firstDraftOf(cards, today))
  const live = useLiveSimulation(workspaceId, simulationQueryOf(draft))
  const names = useMemo(() => namesOf(draft, cards, accounts), [draft, cards, accounts])
  return (
    <>
      <section
        aria-label={messages.form}
        className="rounded-lg border border-border bg-surface p-4"
      >
        <PurchaseForm
          workspaceId={workspaceId}
          draft={draft}
          today={today}
          cards={cards}
          accounts={accounts}
          balances={balances}
          onChange={(change) => setDraft((current) => ({ ...current, ...change }))}
        />
      </section>
      <section aria-label={messages.result} aria-live="polite">
        <PurchaseResult live={live} names={names} />
      </section>
    </>
  )
}
