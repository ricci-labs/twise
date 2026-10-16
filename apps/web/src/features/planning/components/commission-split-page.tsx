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
import { showToast } from '@web/components/feedback/toast'
import { FieldGroup } from '@web/components/forms/field-group'
import { MoneyInput } from '@web/components/inputs/money-input'
import { PageFrame } from '@web/components/layout/page-frame'
import { SubPageHeader } from '@web/components/layout/sub-page-header'
import {
  accountsQueryOptions,
  allocationPartsQueryOptions,
  allocationStepsQueryOptions,
  allocationSuggestionQueryOptions,
  goalsQueryOptions,
  overviewQueryOptions,
} from '@web/features/planning/api/planning.queries'
import { useRecordPart } from '@web/features/planning/api/use-record-part'
import { CommissionFromField } from '@web/features/planning/components/commission-from-field'
import { stepViewOf } from '@web/features/planning/components/split-views'
import { TransferPickerSheet } from '@web/features/planning/components/transfer-picker-sheet'
import { planningMessages } from '@web/features/planning/planning.messages'
import type {
  CommissionDonePart,
  CommissionPart,
  CommissionPartRowProps,
  CommissionSplitPageProps,
  CommissionSplitProps,
  CommissionSuggestedPart,
  EmptyStepsProps,
  SplitContext,
} from '@web/features/planning/planning.types'
import { useDebouncedValue } from '@web/hooks/use-debounced-value'
import { usePageTitle } from '@web/hooks/use-page-title'
import { ApiError } from '@web/lib/api/api-error'
import { errorMessageFor } from '@web/lib/errors/error-message'
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
      {!failed && steps.data?.length === 0 && <EmptySteps workspaceId={workspaceId} />}
      {!failed &&
      steps.data &&
      steps.data.length > 0 &&
      goals.data &&
      accounts.data &&
      overview.data ? (
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
    enabled: amountCents > 0,
  })
  const periodLabel = overview.period.label
  const doneParts =
    useQuery(allocationPartsQueryOptions(workspaceId, periodLabel)).data?.items ?? []
  const [picking, setPicking] = useState<CommissionPart | null>(null)
  const toSplit = overview.insights.find((insight) => insight.code === TO_SPLIT)
  const context = {
    goals: new Map(goals.map((goal) => [goal.id, goal])),
    accounts: new Map(accounts.map((account) => [account.id, account])),
    overspentCents: Math.max(-overview.metrics.freeToSpend, 0),
  }
  const parts = partsOf(suggestion.data?.parts ?? [], steps, context, doneParts)
  useReturnedPart(workspaceId, periodLabel, parts)
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
                onAlreadyDone={() => setPicking(part)}
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
      {picking?.toAccountId && (
        <TransferPickerSheet
          workspaceId={workspaceId}
          periodLabel={periodLabel}
          position={picking.position}
          toAccountId={picking.toAccountId}
          destinationName={picking.destinationName ?? ''}
          isOpen
          onOpenChange={(isOpen) => !isOpen && setPicking(null)}
        />
      )}
    </div>
  )
}

function CommissionPartRow({
  part,
  fromAccountId,
  canTransfer,
  onAlreadyDone,
}: CommissionPartRowProps) {
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
        {isTransferable(part, fromAccountId, canTransfer) && (
          <TextLink
            render={<button type="button" />}
            aria-label={messages.alreadyDoneLabel(part.label)}
            onClick={onAlreadyDone}
            className="mt-1 self-start text-body-sm"
          >
            {messages.alreadyDone}
          </TextLink>
        )}
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
  if (!isTransferable(part, fromAccountId, canTransfer)) {
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

function partsOf(
  suggested: CommissionSuggestedPart[],
  steps: CommissionSplitProps['steps'],
  context: SplitContext,
  doneParts: readonly CommissionDonePart[],
): CommissionPart[] {
  return suggested.flatMap((part) => {
    const step = steps[part.position - 1]
    if (!step) {
      return []
    }
    return [
      {
        position: part.position,
        label: stepViewOf(step, context).exampleLabel,
        destinationName: context.accounts.get(part.toAccountId ?? '')?.name ?? null,
        toAccountId: part.toAccountId,
        amountCents: part.amountCents,
        isDone: doneParts.some(
          (done) => done.position === part.position && done.toAccountId === part.toAccountId,
        ),
      },
    ]
  })
}

function EmptySteps({ workspaceId }: EmptyStepsProps) {
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

function useReturnedPart(workspaceId: string, periodLabel: string, parts: CommissionPart[]) {
  const navigate = useNavigate()
  const record = useRecordPart(workspaceId)
  const { splitDone, splitEntry } = useSearch({ strict: false })
  const part = parts.find((candidate) => candidate.position === splitDone)
  const recordPart = record.mutate
  useEffect(() => {
    if (!splitDone || !splitEntry || !part?.toAccountId) {
      return
    }
    recordPart(
      { periodLabel, position: part.position, toAccountId: part.toAccountId, entryId: splitEntry },
      { onError: (error) => showToast(errorMessageFor(error), { tone: 'danger' }) },
    )
    void navigate({
      to: '.',
      search: (previous) => ({ ...previous, splitDone: undefined, splitEntry: undefined }),
    })
  }, [splitDone, splitEntry, part, periodLabel, recordPart, navigate])
}

function isTransferable(part: CommissionPart, fromAccountId: string, canTransfer: boolean) {
  return (
    canTransfer && !part.isDone && part.toAccountId !== null && part.toAccountId !== fromAccountId
  )
}

function everydayAccountOf(accounts: CommissionSplitProps['accounts']): string {
  const usable = accounts.filter(isUsableMoneyAccount)
  return (usable.find((account) => account.kind === CHECKING) ?? usable[0])?.id ?? ''
}

function isUsableMoneyAccount(account: CommissionSplitProps['accounts'][number]): boolean {
  return MONEY_KINDS.includes(account.kind) && !account.isSystem && account.archivedAt === null
}
