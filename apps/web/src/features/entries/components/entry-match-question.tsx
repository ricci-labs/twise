import { formatBrl } from '@financas/shared'
import { useQuery } from '@tanstack/react-query'
import { showToast } from '@web/components/feedback/toast'
import { type MatchOption, MatchQuestion } from '@web/components/finance/match-question'
import {
  accountsQueryOptions,
  occurrenceSuggestionsQueryOptions,
} from '@web/features/entries/api/entries.queries'
import { useMatchOccurrence } from '@web/features/entries/api/use-match-occurrence'
import { entriesMessages } from '@web/features/entries/entries.messages'
import type {
  EntryMatchQuestionProps,
  MatchableOccurrenceView,
} from '@web/features/entries/entries.types'
import { errorMessageFor } from '@web/lib/errors/error-message'
import { formatShortDate } from '@web/lib/format/calendar'
import { useEffect, useState } from 'react'

const messages = entriesMessages.match
const ESTIMATE = '≈ '

export function EntryMatchQuestion(props: EntryMatchQuestionProps) {
  const question = useMatchQuestion(props)
  if (!question) {
    return null
  }
  const { occurrence, saved, onDone } = props
  const { candidates, chosen, setPicked, nameOf, confirm, isConfirming, problem } = question
  const account = nameOf(saved.accountId)
  const amount = formatBrl(saved.amountCents)
  return (
    <MatchQuestion
      title={
        occurrence
          ? messages.planned(occurrence.description, formatShortDate(occurrence.dueOn))
          : messages.suggested
      }
      lead={occurrence ? undefined : messages.recorded(saved.description, amount, account)}
      note={occurrence ? messages.justRecorded(saved.description, amount, account) : undefined}
      options={candidates.map((candidate) =>
        optionOf(candidate, occurrence ? nameOf(candidate.sourceAccountId) : undefined),
      )}
      optionsLabel={messages.optionsLabel}
      value={chosen.id}
      onValueChange={setPicked}
      isOpen
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onDone()
        }
      }}
      declineLabel={occurrence ? messages.no : messages.none}
      confirmLabel={occurrence ? messages.yes : messages.pays(chosen.description)}
      onDecline={onDone}
      onConfirm={() => void confirm()}
      isConfirming={isConfirming}
      problem={problem}
    />
  )
}

function useMatchQuestion({ workspaceId, saved, occurrence, onDone }: EntryMatchQuestionProps) {
  const accounts = useQuery(accountsQueryOptions(workspaceId))
  const suggestions = useQuery({
    ...occurrenceSuggestionsQueryOptions(workspaceId, saved.entryId),
    enabled: occurrence === undefined,
  })
  const match = useMatchOccurrence(workspaceId)
  const [picked, setPicked] = useState<string | null>(null)
  const [problem, setProblem] = useState<string | null>(null)
  const candidates = occurrence ? [occurrence] : (suggestions.data ?? [])
  const hasNothingToAsk =
    occurrence === undefined && (suggestions.isError || suggestions.data?.length === 0)

  useEffect(() => {
    if (hasNothingToAsk) {
      onDone()
    }
  }, [hasNothingToAsk, onDone])

  const chosen = candidates.find((candidate) => candidate.id === picked) ?? candidates[0]
  if (!chosen || hasNothingToAsk) {
    return null
  }

  async function confirm() {
    if (!chosen) {
      return
    }
    setProblem(null)
    try {
      await match.mutateAsync({ occurrenceId: chosen.id, entryId: saved.entryId })
      showToast(messages.linked(chosen.description, formatShortDate(chosen.dueOn)), {
        tone: 'success',
      })
      onDone()
    } catch (error) {
      setProblem(errorMessageFor(error))
    }
  }

  return {
    candidates,
    chosen,
    setPicked,
    nameOf: (accountId: string) =>
      accounts.data?.find((account) => account.id === accountId)?.name ?? '',
    confirm,
    isConfirming: match.isPending,
    problem,
  }
}

function optionOf(occurrence: MatchableOccurrenceView, account: string | undefined): MatchOption {
  return {
    value: occurrence.id,
    title: occurrence.description,
    detail: detailOf(occurrence, account),
  }
}

function detailOf(occurrence: MatchableOccurrenceView, account: string | undefined): string {
  const amount = `${occurrence.amountIsEstimate ? ESTIMATE : ''}${formatBrl(occurrence.amountCents)}`
  const date = formatShortDate(occurrence.dueOn)
  if (account !== undefined) {
    return messages.plannedForWith(date, amount, account)
  }
  return occurrence.isOverdue
    ? messages.overdueSince(date, amount)
    : messages.plannedFor(date, amount)
}
