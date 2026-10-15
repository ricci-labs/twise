import { Radio } from '@base-ui/react/radio'
import { RadioGroup } from '@base-ui/react/radio-group'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@web/components/actions/button'
import { ShowMoreButton } from '@web/components/actions/show-more-button'
import { Amount } from '@web/components/display/amount'
import { Badge } from '@web/components/display/badge'
import { CategoryArt } from '@web/components/display/category-art'
import { Alert } from '@web/components/feedback/alert'
import { ListSkeleton } from '@web/components/feedback/list-skeleton'
import { showToast } from '@web/components/feedback/toast'
import { SearchInput } from '@web/components/inputs/search-input'
import { Sheet } from '@web/components/layout/sheet'
import { candidatesQueryOptions } from '@web/features/planning/api/planning.queries'
import { useOccurrenceAction } from '@web/features/planning/api/use-occurrence-action'
import { planningMessages } from '@web/features/planning/planning.messages'
import type {
  CandidateRowProps,
  EntryPickerSheetProps,
} from '@web/features/planning/planning.types'
import { useLongList } from '@web/hooks/use-long-list'
import { errorMessageFor } from '@web/lib/errors/error-message'
import { formatShortDate, formatWeekdayDayMonth } from '@web/lib/format/calendar'
import { LIST_SEARCH_ABOVE, matchesSearch } from '@web/lib/long-lists'
import { useState } from 'react'

const messages = planningMessages.occurrences
const copy = messages.picker
const SKELETON_ROWS = 3

export function EntryPickerSheet({
  workspaceId,
  occurrence,
  accounts,
  isOpen,
  onOpenChange,
}: EntryPickerSheetProps) {
  const account = accounts.get(occurrence.sourceAccountId)?.name ?? ''
  const date = formatShortDate(occurrence.dueOn)
  return (
    <Sheet
      title={copy.title}
      description={copy.text(
        copy.kinds[occurrence.entryType],
        account,
        occurrence.description,
        date,
      )}
      closeLabel={copy.cancel}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    >
      {isOpen && (
        <Candidates
          workspaceId={workspaceId}
          occurrence={occurrence}
          accounts={accounts}
          isOpen={isOpen}
          onOpenChange={onOpenChange}
        />
      )}
    </Sheet>
  )
}

function Candidates({ workspaceId, occurrence, accounts, onOpenChange }: EntryPickerSheetProps) {
  const candidates = useQuery(candidatesQueryOptions(workspaceId, occurrence.id))
  const action = useOccurrenceAction(workspaceId)
  const [picked, setPicked] = useState<string | null>(null)
  const [problem, setProblem] = useState<string | null>(null)
  const items = candidates.data?.items ?? []
  const chosen = picked ?? items.find((item) => item.isLikely)?.entryId ?? null
  const list = useLongList({
    items,
    isPinned: (item) => item.entryId === chosen,
    searchAbove: LIST_SEARCH_ABOVE,
    searchResults: (all, search) => all.filter((item) => matchesSearch(item.description, search)),
    canShorten: true,
  })
  const isIncome = occurrence.entryType === 'income'

  async function match() {
    if (!chosen) {
      return
    }
    setProblem(null)
    try {
      await action.mutateAsync({ action: 'match', occurrenceId: occurrence.id, entryId: chosen })
      onOpenChange(false)
      const date = formatShortDate(occurrence.dueOn)
      showToast(
        isIncome
          ? copy.receivedToast(occurrence.description, date)
          : copy.paidToast(occurrence.description, date),
        {
          tone: 'success',
          action: {
            label: messages.undo,
            onPress: () => void action.mutate({ action: 'unmatch', occurrenceId: occurrence.id }),
          },
        },
      )
    } catch (error) {
      setProblem(errorMessageFor(error))
    }
  }

  if (candidates.isError) {
    return <Alert tone="danger">{copy.failed}</Alert>
  }
  if (!candidates.data) {
    return <ListSkeleton rows={SKELETON_ROWS} />
  }
  return (
    <div className="flex flex-col gap-3">
      {problem && <Alert tone="danger">{problem}</Alert>}
      {list.hasSearch && (
        <SearchInput label={copy.search} value={list.search} onValueChange={list.setSearch} />
      )}
      {items.length === 0 ? (
        <p className="text-body-sm text-ink-muted">{copy.empty}</p>
      ) : (
        <RadioGroup
          aria-label={copy.label}
          value={chosen}
          onValueChange={(next) => setPicked(String(next))}
          className="flex flex-col gap-1"
        >
          {list.shown.map((item, position) => (
            <CandidateRow
              key={item.entryId}
              item={item}
              account={accounts.get(occurrence.sourceAccountId)?.name ?? ''}
              art={item.counterpartAccountId ? accounts.get(item.counterpartAccountId) : undefined}
              rowRef={list.refAt(position)}
            />
          ))}
        </RadioGroup>
      )}
      {list.hiddenCount > 0 && (
        <ShowMoreButton hiddenCount={list.hiddenCount} onClick={list.showAll} />
      )}
      <div className="grid grid-cols-2 gap-3">
        <Button variant="secondary" onClick={() => onOpenChange(false)}>
          {copy.cancel}
        </Button>
        <Button isLoading={action.isPending} isDisabled={!chosen} onClick={() => void match()}>
          {isIncome ? copy.markReceived : copy.markPaid}
        </Button>
      </div>
    </div>
  )
}

function CandidateRow({ item, account, art, rowRef }: CandidateRowProps) {
  return (
    <Radio.Root
      ref={rowRef}
      value={item.entryId}
      nativeButton
      render={<button type="button" />}
      className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-start text-ink outline-none focus-visible:ring-2 focus-visible:ring-focus-ring data-checked:inset-ring-2 data-checked:inset-ring-ink"
    >
      <CategoryArt name={art?.name ?? item.description} icon={art?.icon} />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="line-clamp-2 text-row font-semibold break-words">{item.description}</span>
        <span className="line-clamp-2 text-row-detail break-words text-ink-muted">
          {item.isLikely && (
            <Badge tone="success" size="compact" hasDot className="me-1.5 align-text-bottom">
              {copy.likely}
            </Badge>
          )}
          {copy.detail(account, formatWeekdayDayMonth(item.occurredOn))}
        </span>
      </span>
      <Amount cents={item.amountCents} size="inherit" className="shrink-0 text-row font-emphasis" />
    </Radio.Root>
  )
}
