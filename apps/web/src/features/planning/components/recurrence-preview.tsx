import { useQueries } from '@tanstack/react-query'
import { NextDatesPreview } from '@web/components/finance/next-dates-preview'
import { holidaysQueryOptions } from '@web/features/planning/api/planning.queries'
import {
  nextDatesOf,
  plannedPreviewOf,
  yearsOf,
} from '@web/features/planning/components/next-dates'
import { scheduleOf } from '@web/features/planning/components/recurrence-input'
import { planningMessages } from '@web/features/planning/planning.messages'
import type {
  RecurrenceFormInput,
  RecurrencePreviewProps,
} from '@web/features/planning/planning.types'
import { centsOfTypedAmount } from '@web/lib/format/money'
import { useWatch } from 'react-hook-form'

export function RecurrencePreview({ workspaceId, today }: RecurrencePreviewProps) {
  const values = useWatch<RecurrenceFormInput>() as RecurrenceFormInput
  const schedule = scheduleOf(values)
  const nationalOnly = plannedPreviewOf(schedule, today)
  const workspaceHolidays = useQueries({
    queries: yearsOf(nationalOnly).map((year) => holidaysQueryOptions(workspaceId, year)),
    combine: (results) =>
      results.flatMap((result) => result.data?.workspace.map((holiday) => holiday.onDate) ?? []),
  })
  const planned = plannedPreviewOf(schedule, today, workspaceHolidays)
  return (
    <NextDatesPreview
      dates={nextDatesOf(planned, schedule, {
        amountCents: centsOfTypedAmount(values.amount) ?? 0,
        isEstimate: values.amountIsEstimate,
      })}
      empty={planningMessages.form.preview.empty}
    />
  )
}
