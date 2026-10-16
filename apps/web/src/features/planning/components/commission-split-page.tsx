import { formatBrl, MONEY_ACCOUNT_KINDS } from '@financas/shared'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { Button } from '@web/components/actions/button'
import { TextLink } from '@web/components/actions/text-link'
import { Amount } from '@web/components/display/amount'
import { Badge } from '@web/components/display/badge'
import { RichText } from '@web/components/display/rich-text'
import { EmptyBlock } from '@web/components/feedback/empty-block'
import { ListSkeleton } from '@web/components/feedback/list-skeleton'
import { SectionError } from '@web/components/feedback/section-error'
import { FieldGroup } from '@web/components/forms/field-group'
import { MoneyInput } from '@web/components/inputs/money-input'
import { PageFrame } from '@web/components/layout/page-frame'
import { SubPageHeader } from '@web/components/layout/sub-page-header'
import {
  accountsQueryOptions,
  allocationStepsQueryOptions,
  allocationSuggestionQueryOptions,
  goalsQueryOptions,
  overviewQueryOptions,
} from '@web/features/planning/api/planning.queries'
import { CommissionFromField } from '@web/features/planning/components/commission-from-field'
import { stepViewOf } from '@web/features/planning/components/split-views'
import { planningMessages } from '@web/features/planning/planning.messages'
import type {
  CommissionPart,
  CommissionPartRowProps,
  CommissionSplitPageProps,
  CommissionSplitProps,
} from '@web/features/planning/planning.types'
import { useDebouncedValue } from '@web/hooks/use-debounced-value'
import { usePageTitle } from '@web/hooks/use-page-title'
import { useRememberedIds } from '@web/hooks/use-remembered-ids'
import { ApiError } from '@web/lib/api/api-error'
import { centsOfTypedAmount, formatTypedAmount } from '@web/lib/format/money'
import { hasPermission } from '@web/lib/permissions'
import { useEffect, useState } from 'react'

const messages = planningMessages.commission
const SKELETON_ROWS = 4
const TO_SPLIT = 'variable_income_to_split'
const MONEY_KINDS: readonly string[] = MONEY_ACCOUNT_KINDS
const CHECKING = 'checking'
const AMOUNT_DELAY_MS = 300

export function CommissionSplitPage({
  workspaceId,
  permissions,
  amountCents,
}: CommissionSplitPageProps) {
  usePageTitle(messages.pageTitle)
  const steps = useQuery(allocationStepsQueryOptions(workspaceId))
  const goals = useQuery(goalsQueryOptions(workspaceId))
  const accounts = useQuery(accountsQueryOptions(workspaceId))
  const overview = useQuery(overviewQueryOptions(workspaceId, undefined))
  const failed = [steps, goals, accounts, overview].find((query) => query.isError)
  return (
    <PageFrame className="gap-3 lg:gap-4">
      <SubPageHeader
        title={messages.title}
        description={messages.description}
        backLabel={messages.back}
        back={<Link to="/w/$workspaceId" params={{ workspaceId }} />}
      />
      {failed ? (
        <SectionError
          message={messages.failed}
          errorRef={failed.error instanceof ApiError ? failed.error.ref : null}
          isRetrying={failed.isFetching}
          onRetry={() => void failed.refetch()}
        />
      ) : null}
      {!failed && steps.data && goals.data && accounts.data && overview.data ? (
        <CommissionSplit
          workspaceId={workspaceId}
          steps={steps.data}
          goals={goals.data}
          accounts={accounts.data}
          overview={overview.data}
          canTransfer={hasPermission(permissions, 'entries', 'create')}
          initialAmountCents={amountCents ?? overview.data.metrics.variableIncome}
        />
      ) : null}
      {!failed && !(steps.data && goals.data && accounts.data && overview.data) && (
        <ListSkeleton rows={SKELETON_ROWS} />
      )}
    </PageFrame>
  )
}

function CommissionSplit({
  workspaceId,
  steps,
  goals,
  accounts,
  overview,
  canTransfer,
  initialAmountCents,
}: CommissionSplitProps) {
  const [amount, setAmount] = useState(() =>
    initialAmountCents > 0 ? formatTypedAmount(initialAmountCents) : '',
  )
  const [fromAccountId, setFromAccountId] = useState(() => everydayAccountOf(accounts))
  const amountCents = useDebouncedValue(centsOfTypedAmount(amount) ?? 0, AMOUNT_DELAY_MS)
  const suggestion = useQuery({
    ...allocationSuggestionQueryOptions(workspaceId, amountCents),
    enabled: amountCents > 0 && steps.length > 0,
  })
  const done = useDoneParts(workspaceId, overview.period.label, amountCents)
  const toSplit = overview.insights.find((insight) => insight.code === TO_SPLIT)
  if (steps.length === 0) {
    return (
      <EmptyBlock
        icon="together"
        title={messages.noSteps}
        text={messages.noStepsText}
        action={
          <Button render={<Link to="/w/$workspaceId/planning/split" params={{ workspaceId }} />}>
            {messages.defineSplit}
          </Button>
        }
      />
    )
  }
  const context = {
    goals: new Map(goals.map((goal) => [goal.id, goal])),
    accounts: new Map(accounts.map((account) => [account.id, account])),
    overspentCents: Math.max(-overview.metrics.freeToSpend, 0),
  }
  const parts: CommissionPart[] = (suggestion.data?.parts ?? []).flatMap((part) => {
    const step = steps[part.position - 1]
    if (!step) {
      return []
    }
    const destination = context.accounts.get(part.toAccountId ?? '')
    return [
      {
        position: part.position,
        label: stepViewOf(step, context).exampleLabel,
        destinationName: destination?.name ?? null,
        toAccountId: part.toAccountId,
        amountCents: part.amountCents,
        isDone: done.ids.has(String(part.position)),
      },
    ]
  })
  return (
    <div className="grid gap-4 lg:grid-cols-5 lg:items-start lg:gap-5">
      <section
        aria-label={messages.partsLabel}
        className="flex flex-col gap-3 rounded-xl border border-border bg-surface px-4 py-4 lg:col-span-3 lg:px-6"
      >
        <p className="text-body-sm text-ink-muted">
          {toSplit ? (
            <RichText
              text={messages.toSplit}
              values={{ amount: formatBrl(Number(toSplit.values.amountCents)) }}
            />
          ) : (
            messages.allSplit
          )}
        </p>
        {amountCents === 0 ? (
          <p className="text-body-sm text-ink-muted">{messages.typeAmount}</p>
        ) : (
          <ol className="flex flex-col">
            {parts.map((part) => (
              <CommissionPartRow
                key={part.position}
                part={part}
                fromAccountId={fromAccountId}
                canTransfer={canTransfer}
              />
            ))}
            <li className="flex items-baseline gap-2 border-t border-ink pt-2.5 text-body-sm font-semibold">
              <span>{messages.leftover}</span>
              <span className="text-ink-muted font-normal">· {messages.leftoverNote}</span>
              <span aria-hidden="true" className="mt-1 min-w-4 flex-1 self-center dotted-leader" />
              <Amount cents={suggestion.data?.leftoverCents ?? 0} size="inherit" />
            </li>
          </ol>
        )}
        <p className="text-note text-ink-muted">{messages.deviceNote}</p>
      </section>
      <section className="order-first flex flex-col gap-4 rounded-xl border border-border bg-surface px-4 py-4 lg:order-none lg:col-span-2 lg:px-6">
        <FieldGroup label={messages.amount}>
          <MoneyInput
            aria-label={messages.amount}
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />
        </FieldGroup>
        <CommissionFromField
          accounts={accounts.filter(isUsableMoneyAccount)}
          value={fromAccountId}
          onChange={setFromAccountId}
        />
        <TextLink
          className="self-start"
          render={<Link to="/w/$workspaceId/planning/split" params={{ workspaceId }} />}
        >
          {messages.editSplit}
        </TextLink>
      </section>
    </div>
  )
}

function CommissionPartRow({ part, fromAccountId, canTransfer }: CommissionPartRowProps) {
  return (
    <li className="flex items-center gap-3 border-border py-2.5 not-first:border-t">
      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-sunken text-caption font-semibold">
        {part.position}
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="line-clamp-2 text-row font-semibold break-words">{part.label}</span>
        <span className="line-clamp-2 text-row-detail text-ink-muted">
          {part.destinationName && part.toAccountId !== fromAccountId
            ? messages.to(part.destinationName)
            : messages.staysHere}
        </span>
      </span>
      <Amount cents={part.amountCents} size="inherit" className="shrink-0 text-row font-emphasis" />
      <PartAction part={part} fromAccountId={fromAccountId} canTransfer={canTransfer} />
    </li>
  )
}

function PartAction({ part, fromAccountId, canTransfer }: CommissionPartRowProps) {
  if (part.isDone) {
    return (
      <Badge tone="success" size="compact" hasDot>
        {messages.done}
      </Badge>
    )
  }
  if (!canTransfer || !part.toAccountId || part.toAccountId === fromAccountId) {
    return null
  }
  return (
    <Button
      variant="secondary"
      size="sm"
      aria-label={messages.transferLabel(part.label)}
      render={
        <Link
          to="."
          search={(previous) => ({
            ...previous,
            entry: 'new',
            entryType: 'transfer',
            entryAccount: fromAccountId || undefined,
            entryToAccount: part.toAccountId ?? undefined,
            entryAmount: part.amountCents,
            entrySplitPart: part.position,
            entrySplitLabel: part.label,
          })}
        />
      }
    >
      {messages.transfer}
    </Button>
  )
}

function useDoneParts(workspaceId: string, periodLabel: string, amountCents: number) {
  const navigate = useNavigate()
  const { splitDone } = useSearch({ strict: false })
  const done = useRememberedIds(
    `twise:commission-split:${workspaceId}:${periodLabel}:${amountCents}`,
  )
  const remember = done.setRemembered
  useEffect(() => {
    if (!splitDone) {
      return
    }
    remember(String(splitDone), true)
    void navigate({ to: '.', search: (previous) => ({ ...previous, splitDone: undefined }) })
  }, [splitDone, remember, navigate])
  return done
}

function everydayAccountOf(accounts: CommissionSplitProps['accounts']): string {
  const usable = accounts.filter(isUsableMoneyAccount)
  return (usable.find((account) => account.kind === CHECKING) ?? usable[0])?.id ?? ''
}

function isUsableMoneyAccount(account: CommissionSplitProps['accounts'][number]): boolean {
  return MONEY_KINDS.includes(account.kind) && !account.isSystem && account.archivedAt === null
}
