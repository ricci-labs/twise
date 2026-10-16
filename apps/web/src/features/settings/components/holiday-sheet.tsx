import { HOLIDAY_NAME_MAX_LENGTH, type NewHoliday } from '@financas/shared'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@web/components/actions/button'
import { Alert } from '@web/components/feedback/alert'
import { showToast } from '@web/components/feedback/toast'
import { Form } from '@web/components/forms/form'
import { FormField } from '@web/components/forms/form-field'
import { SubmitButton } from '@web/components/forms/submit-button'
import { DateInput } from '@web/components/inputs/date-input'
import { TextInput } from '@web/components/inputs/text-input'
import { Sheet } from '@web/components/layout/sheet'
import { holidaysQueryOptions } from '@web/features/settings/api/settings.queries'
import { useAddHoliday } from '@web/features/settings/api/use-add-holiday'
import { settingsMessages } from '@web/features/settings/settings.messages'
import { holidayFormSchemaFor } from '@web/features/settings/settings.schemas'
import type { HolidayFormInput, HolidaySheetProps } from '@web/features/settings/settings.types'
import { ApiError } from '@web/lib/api/api-error'
import { errorMessageFor } from '@web/lib/errors/error-message'
import { useSchemaForm } from '@web/lib/forms/use-schema-form'
import { useMemo, useState } from 'react'

const copy = settingsMessages.sheet
const DATE_REFUSALS = new Set(['HOLIDAY_ALREADY_NATIONAL', 'HOLIDAY_DATE_TAKEN'])
const SERVER_REFUSAL = 'server'

export function HolidaySheet(props: HolidaySheetProps) {
  return (
    <Sheet
      title={copy.title}
      closeLabel={copy.close}
      isOpen={props.isOpen}
      onOpenChange={props.onOpenChange}
    >
      {props.isOpen && <HolidayForm {...props} />}
    </Sheet>
  )
}

function HolidayForm({ workspaceId, year, today, onOpenChange, onAdded }: HolidaySheetProps) {
  const add = useAddHoliday(workspaceId)
  const [problem, setProblem] = useState<string | null>(null)
  const workspaceHolidays = useQuery(holidaysQueryOptions(workspaceId, year)).data?.workspace
  const schema = useMemo(
    () => holidayFormSchemaFor(new Set(workspaceHolidays?.map((holiday) => holiday.onDate))),
    [workspaceHolidays],
  )
  const form = useSchemaForm({
    schema,
    requiredMessages: copy.required,
    defaultValues: { onDate: '', name: '' },
  })

  async function save(holiday: NewHoliday) {
    setProblem(null)
    try {
      await add.mutateAsync(holiday)
      onOpenChange(false)
      showToast(copy.added, { tone: 'success' })
      onAdded(holiday.onDate)
    } catch (error) {
      showProblem(error)
    }
  }

  function showProblem(error: unknown) {
    if (error instanceof ApiError && DATE_REFUSALS.has(error.code)) {
      form.setError(
        'onDate',
        { type: SERVER_REFUSAL, message: errorMessageFor(error) },
        { shouldFocus: true },
      )
      return
    }
    setProblem(errorMessageFor(error))
  }

  return (
    <Form form={form} onSubmit={save} className="flex flex-col gap-4 pt-2">
      <FormField<HolidayFormInput> name="onDate" label={copy.date} isRequired>
        {(control) => <DateInput title={copy.date} today={today} {...control} />}
      </FormField>
      <div className="flex flex-col gap-2">
        <FormField<HolidayFormInput>
          name="name"
          label={copy.name}
          isRequired
          maxLength={HOLIDAY_NAME_MAX_LENGTH}
        >
          {(control) => <TextInput autoComplete="off" {...control} />}
        </FormField>
        <p className="text-note text-ink-muted">{copy.help}</p>
      </div>
      {problem && (
        <Alert tone="danger" isUrgent>
          {problem}
        </Alert>
      )}
      <div className="-mx-4 flex items-center justify-between gap-3 border-t border-border px-4 pt-4">
        <Button variant="tertiary" onClick={() => onOpenChange(false)}>
          {copy.cancel}
        </Button>
        <SubmitButton loadingLabel={copy.submitting} className="max-w-62 flex-1">
          {copy.submit}
        </SubmitButton>
      </div>
    </Form>
  )
}
