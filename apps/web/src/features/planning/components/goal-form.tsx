import { useNavigate, useSearch } from '@tanstack/react-router'
import { ConfirmDialog } from '@web/components/feedback/confirm-dialog'
import { OfflineBanner } from '@web/components/feedback/offline-banner'
import { showToast } from '@web/components/feedback/toast'
import { FormOverlay } from '@web/components/layout/form-overlay'
import { useChangeGoal, useCreateGoal } from '@web/features/planning/api/use-save-goal'
import { GoalFields } from '@web/features/planning/components/goal-fields'
import { GoalFormFooter } from '@web/features/planning/components/goal-form-footer'
import { goalChangeOf, newGoalOf } from '@web/features/planning/components/goal-input'
import { planningMessages } from '@web/features/planning/planning.messages'
import { goalFormSchema } from '@web/features/planning/planning.schemas'
import type { GoalFormProps, GoalFormValues } from '@web/features/planning/planning.types'
import { useIsOnline } from '@web/hooks/use-is-online'
import { ApiError } from '@web/lib/api/api-error'
import { errorMessageFor } from '@web/lib/errors/error-message'
import { fill } from '@web/lib/format/template'
import { useSchemaForm } from '@web/lib/forms/use-schema-form'
import { useEffect, useRef, useState } from 'react'
import { FormProvider, type UseFormReturn, useFormState } from 'react-hook-form'

const messages = planningMessages.goals.form
const FIELD_OF_CODE: Partial<Record<string, keyof GoalFormValues>> = {
  GOAL_ACCOUNT_TAKEN: 'accountId',
  GOAL_ACCOUNT_INVALID: 'accountId',
  RESERVE_ALREADY_SET: 'isReserve',
}

export function GoalForm({
  workspaceId,
  today,
  accounts,
  goals,
  defaults,
  editingGoalId,
  onClose,
}: GoalFormProps) {
  const isOnline = useIsOnline()
  const createGoal = useCreateGoal(workspaceId)
  const changeGoal = useChangeGoal(workspaceId, editingGoalId ?? '')
  const [problem, setProblem] = useState<string | null>(null)
  const [isDiscarding, setIsDiscarding] = useState(false)
  const nameInput = useRef<HTMLInputElement>(null)
  const form = useSchemaForm({
    schema: goalFormSchema,
    requiredMessages: messages.required,
    defaultValues: defaults,
  })
  const { isDirty } = useFormState({ control: form.control })
  useCreatedAccount(form)

  function requestClose() {
    if (isDirty) {
      setIsDiscarding(true)
      return
    }
    onClose()
  }

  async function save(values: GoalFormValues) {
    setProblem(null)
    try {
      if (editingGoalId) {
        await changeGoal.mutateAsync(goalChangeOf(values))
        showToast(messages.saved, { tone: 'success' })
      } else {
        await createGoal.mutateAsync(newGoalOf(values))
        showToast(messages.created, { tone: 'success' })
      }
      onClose()
    } catch (error) {
      const field = error instanceof ApiError ? FIELD_OF_CODE[error.code] : undefined
      if (field) {
        form.setError(field, { message: errorMessageFor(error) })
        return
      }
      setProblem(problemOf(error))
    }
  }

  return (
    <FormProvider {...form}>
      <FormOverlay
        title={editingGoalId ? messages.editTitle : messages.title}
        closeLabel={messages.close}
        size="wide"
        actions="single"
        isOpen
        onRequestClose={requestClose}
        onSubmit={form.handleSubmit(save)}
        initialFocus={nameInput}
        banner={<OfflineBanner message={messages.offline} />}
        footer={
          <GoalFormFooter
            isOnline={isOnline}
            problem={problem}
            isEditing={editingGoalId !== undefined}
            onCancel={requestClose}
          />
        }
      >
        <GoalFields
          workspaceId={workspaceId}
          today={today}
          accounts={accounts}
          goals={goals}
          editingGoalId={editingGoalId}
          nameInput={nameInput}
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

function useCreatedAccount(form: UseFormReturn<GoalFormValues>) {
  const navigate = useNavigate()
  const { createdAccount } = useSearch({ strict: false })
  useEffect(() => {
    if (!createdAccount) {
      return
    }
    form.setValue('accountId', createdAccount, { shouldDirty: true, shouldValidate: true })
    void navigate({ to: '.', search: (previous) => ({ ...previous, createdAccount: undefined }) })
  }, [createdAccount, form, navigate])
}

function problemOf(error: unknown): string {
  const ref = error instanceof ApiError ? error.ref : null
  return ref ? fill(messages.failed, { ref }) : errorMessageFor(error)
}
