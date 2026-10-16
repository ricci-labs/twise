import { Radio } from '@base-ui/react/radio'
import { RadioGroup } from '@base-ui/react/radio-group'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@web/components/actions/button'
import { ShowMoreButton } from '@web/components/actions/show-more-button'
import { Amount } from '@web/components/display/amount'
import { Alert } from '@web/components/feedback/alert'
import { ListSkeleton } from '@web/components/feedback/list-skeleton'
import { showToast } from '@web/components/feedback/toast'
import { SearchInput } from '@web/components/inputs/search-input'
import { Sheet } from '@web/components/layout/sheet'
import { partCandidatesQueryOptions } from '@web/features/planning/api/planning.queries'
import { useRecordPart } from '@web/features/planning/api/use-record-part'
import { planningMessages } from '@web/features/planning/planning.messages'
import type { TransferPickerSheetProps } from '@web/features/planning/planning.types'
import { useLongList } from '@web/hooks/use-long-list'
import { errorMessageFor } from '@web/lib/errors/error-message'
import { formatWeekdayDayMonth } from '@web/lib/format/calendar'
import { LIST_SEARCH_ABOVE, matchesSearch } from '@web/lib/long-lists'
import { useState } from 'react'

const copy = planningMessages.commission.picker
const SKELETON_ROWS = 3

export function TransferPickerSheet(props: TransferPickerSheetProps) {
  return (
    <Sheet
      title={copy.title}
      description={copy.text(props.destinationName)}
      closeLabel={copy.cancel}
      isOpen={props.isOpen}
      onOpenChange={props.onOpenChange}
    >
      {props.isOpen && <Transfers {...props} />}
    </Sheet>
  )
}

function Transfers({
  workspaceId,
  periodLabel,
  position,
  toAccountId,
  onOpenChange,
}: TransferPickerSheetProps) {
  const candidates = useQuery(partCandidatesQueryOptions(workspaceId, toAccountId))
  const record = useRecordPart(workspaceId)
  const [picked, setPicked] = useState<string | null>(null)
  const [problem, setProblem] = useState<string | null>(null)
  const items = candidates.data?.items ?? []
  const list = useLongList({
    items,
    isPinned: (item) => item.entryId === picked,
    searchAbove: LIST_SEARCH_ABOVE,
    searchResults: (all, search) => all.filter((item) => matchesSearch(item.description, search)),
    canShorten: true,
  })

  async function mark() {
    if (!picked) {
      return
    }
    setProblem(null)
    try {
      await record.mutateAsync({ periodLabel, position, toAccountId, entryId: picked })
      onOpenChange(false)
      showToast(copy.marked, { tone: 'success' })
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
          value={picked}
          onValueChange={(next) => setPicked(String(next))}
          className="flex flex-col gap-1"
        >
          {list.shown.map((item, index) => (
            <Radio.Root
              key={item.entryId}
              ref={list.refAt(index)}
              value={item.entryId}
              nativeButton
              render={<button type="button" />}
              className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-start text-ink outline-none focus-visible:ring-2 focus-visible:ring-focus-ring data-checked:inset-ring-2 data-checked:inset-ring-ink"
            >
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="line-clamp-2 text-row font-semibold break-words">
                  {item.description}
                </span>
                <span className="text-row-detail text-ink-muted">
                  {formatWeekdayDayMonth(item.occurredOn)}
                </span>
              </span>
              <Amount
                cents={item.amountCents}
                size="inherit"
                className="shrink-0 text-row font-emphasis"
              />
            </Radio.Root>
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
        <Button isLoading={record.isPending} isDisabled={!picked} onClick={() => void mark()}>
          {copy.mark}
        </Button>
      </div>
    </div>
  )
}
