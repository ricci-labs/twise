import { Alert } from '@web/components/feedback/alert'
import { ConfirmDialog } from '@web/components/feedback/confirm-dialog'
import { OfflineBanner } from '@web/components/feedback/offline-banner'
import { showToast } from '@web/components/feedback/toast'
import { FormOverlay } from '@web/components/layout/form-overlay'
import { useChangeRecurrence } from '@web/features/planning/api/use-change-recurrence'
import { useCreateRecurrence } from '@web/features/planning/api/use-create-recurrence'
import { RecurrenceFields } from '@web/features/planning/components/recurrence-fields'
import { RecurrenceFormFooter } from '@web/features/planning/components/recurrence-form-footer'
import { newRuleOf, ruleChangeOf } from '@web/features/planning/components/recurrence-input'
import { planningMessages } from '@web/features/planning/planning.messages'
import { recurrenceFormSchema } from '@web/features/planning/planning.schemas'
import type {
  RecurrenceFormProps,
  RecurrenceFormValues,
} from '@web/features/planning/planning.types'
import { useIsOnline } from '@web/hooks/use-is-online'
import { ApiError } from '@web/lib/api/api-error'
import { errorMessageFor } from '@web/lib/errors/error-message'
import { fill } from '@web/lib/format/template'
import { useSchemaForm } from '@web/lib/forms/use-schema-form'
import { useRef, useState } from 'react'
import { FormProvider, useFormState } from 'react-hook-form'

const messages = planningMessages.form
const ACCOUNTS_INVALID = 'RECURRENCE_ACCOUNTS_INVALID'

export function RecurrenceForm({
  workspaceId,
  today,
  accounts,
  defaults,
  edit,
  onClose,
}: RecurrenceFormProps) {
  const isOnline = useIsOnline()
  const createRecurrence = useCreateRecurrence(workspaceId)
  const changeRecurrence = useChangeRecurrence(workspaceId, edit?.ruleId ?? '')
  const [problem, setProblem] = useState<string | null>(null)
  const [isDiscarding, setIsDiscarding] = useState(false)
  const descriptionInput = useRef<HTMLInputElement>(null)
  const form = useSchemaForm({
    schema: recurrenceFormSchema,
    requiredMessages: messages.required,
    defaultValues: defaults,
  })
  const { isDirty } = useFormState({ control: form.control })

  function requestClose() {
    if (isDirty) {
      setIsDiscarding(true)
      return
    }
    onClose()
  }

  async function save(values: RecurrenceFormValues) {
    setProblem(null)
    try {
      if (edit) {
        await changeRecurrence.mutateAsync(ruleChangeOf(values))
        showToast(messages.saved(values.description), { tone: 'success' })
      } else {
        await createRecurrence.mutateAsync(newRuleOf(values))
        showToast(messages.created(values.description), { tone: 'success' })
      }
      onClose()
    } catch (error) {
      setProblem(problemOf(error))
    }
  }

  return (
    <FormProvider {...form}>
      <FormOverlay
        title={edit ? messages.editTitle : messages.title}
        closeLabel={messages.close}
        size="lg"
        actions="single"
        isOpen
        onRequestClose={requestClose}
        onSubmit={form.handleSubmit(save)}
        initialFocus={descriptionInput}
        banner={<OfflineBanner message={messages.offline} />}
        footer={
          <RecurrenceFormFooter
            isOnline={isOnline}
            problem={problem}
            isEditing={edit !== undefined}
            onCancel={requestClose}
          />
        }
      >
        {edit?.warning && (
          <Alert tone="warning" className="mx-4 mt-3.5 lg:mx-8">
            {edit.warning}
          </Alert>
        )}
        <RecurrenceFields
          workspaceId={workspaceId}
          today={today}
          accounts={accounts}
          descriptionInput={descriptionInput}
          isTypeLocked={edit !== undefined}
        />
      </FormOverlay>
      <ConfirmDialog
        title={messages.discard.title}
        description={messages.discard.text}
        cancelLabel={messages.discard.keep}
        confirmLabel={messages.discard.confirm}
        isOpen={isDiscarding}
        onOpenChange={setIsDiscarding}
        onConfirm={onClose}
      />
    </FormProvider>
  )
}

function problemOf(error: unknown): string {
  const isAccountsProblem = error instanceof ApiError && error.code === ACCOUNTS_INVALID
  const ref = error instanceof ApiError ? error.ref : null
  if (isAccountsProblem || !ref) {
    return errorMessageFor(error)
  }
  return fill(messages.failed, { ref })
}
