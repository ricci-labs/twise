import { todayIn } from '@financas/shared'
import { Link } from '@tanstack/react-router'
import { Button } from '@web/components/actions/button'
import { Alert } from '@web/components/feedback/alert'
import { ConfirmDialog } from '@web/components/feedback/confirm-dialog'
import { OfflineBanner } from '@web/components/feedback/offline-banner'
import { showToast } from '@web/components/feedback/toast'
import { FormField } from '@web/components/forms/form-field'
import { LockedField } from '@web/components/forms/locked-field'
import { SubmitButton } from '@web/components/forms/submit-button'
import { TextArea } from '@web/components/inputs/text-area'
import { TextInput } from '@web/components/inputs/text-input'
import { FormOverlay } from '@web/components/layout/form-overlay'
import { useChangeEntry } from '@web/features/entries/api/use-change-entry'
import { EntryFormFields } from '@web/features/entries/components/entry-form-fields'
import { formInputOf } from '@web/features/entries/components/entry-form-values'
import { toEntryInput } from '@web/features/entries/components/entry-input'
import { isSpending } from '@web/features/entries/components/entry-kind'
import { changeEntryType } from '@web/features/entries/components/entry-type-change'
import { entriesMessages } from '@web/features/entries/entries.messages'
import { entryDetailsFormSchema, entryFormSchema } from '@web/features/entries/entries.schemas'
import type {
  DiscardDialogProps,
  EditFooterProps,
  EntryConflictProps,
  EntryDetailsFormValues,
  EntryEditProps,
  EntryFormInput,
  EntryFormValues,
  FormEntryType,
  LockedEntryEditProps,
  VersionNoteProps,
} from '@web/features/entries/entries.types'
import { useAmountWarning } from '@web/features/entries/hooks/use-amount-warning'
import { useAutoFill } from '@web/features/entries/hooks/use-auto-fill'
import { useCardPlan } from '@web/features/entries/hooks/use-card-plan'
import { useShareTotals } from '@web/features/entries/hooks/use-share-totals'
import { useIsOnline } from '@web/hooks/use-is-online'
import { ApiError } from '@web/lib/api/api-error'
import { errorMessageFor } from '@web/lib/errors/error-message'
import { useSchemaForm } from '@web/lib/forms/use-schema-form'
import { hasPermission } from '@web/lib/permissions'
import { useRef, useState } from 'react'
import { FormProvider, useFormState, useWatch } from 'react-hook-form'

const messages = entriesMessages.edit
const fields = entriesMessages.fields
const changedNames: Readonly<Record<string, string>> = messages.changed
const IN_PLACE: ReadonlySet<string> = new Set(['description', 'notes'])
const CONFLICT = 'ENTRY_ALREADY_DELETED'
const TIME_ZONE = 'America/Sao_Paulo'

export function EntryEdit(props: EntryEditProps) {
  return props.locked ? (
    <LockedEntryEdit {...props} locked={props.locked} />
  ) : (
    <EntryReplaceForm {...props} />
  )
}

function EntryReplaceForm({
  workspaceId,
  entry,
  currentUserName,
  permissions,
  onClose,
  onSaved,
}: EntryEditProps) {
  const today = todayIn(TIME_ZONE, new Date())
  const isOnline = useIsOnline()
  const change = useChangeEntry(workspaceId)
  const amountInput = useRef<HTMLInputElement>(null)
  const [problem, setProblem] = useState<string | null>(null)
  const [isConflict, setIsConflict] = useState(false)
  const [isDiscarding, setIsDiscarding] = useState(false)
  const form = useSchemaForm({
    schema: entryFormSchema,
    requiredMessages: entriesMessages.required,
    defaultValues: formInputOf(entry),
  })
  const autoFill = useAutoFill(form, amountInput)
  const plan = useCardPlan(form.control, workspaceId, today)
  const amountWarning = useAmountWarning(form.control, workspaceId)
  const shareTotals = useShareTotals(form.control)
  const entryType = useWatch({ control: form.control, name: 'entryType' })
  const { dirtyFields, isDirty } = useFormState({ control: form.control })
  const changed = changedOf(dirtyFields)

  async function save(values: EntryFormValues) {
    setProblem(null)
    try {
      const savedId = await change.mutateAsync(
        changed.length === 0
          ? {
              mode: 'details',
              entryId: entry.id,
              description: values.description,
              notes: values.notes,
            }
          : { mode: 'replace', entryId: entry.id, input: toEntryInput(values) },
      )
      showToast(messages.saved, { tone: 'success' })
      onSaved(savedId)
    } catch (error) {
      if (error instanceof ApiError && error.code === CONFLICT) {
        setIsConflict(true)
        return
      }
      setProblem(errorMessageFor(error))
    }
  }

  return (
    <FormProvider {...form}>
      <FormOverlay
        title={messages.title}
        closeLabel={messages.close}
        isOpen
        onRequestClose={() => (isDirty ? setIsDiscarding(true) : onClose())}
        onSubmit={form.handleSubmit(save)}
        initialFocus={amountInput}
        banner={<OfflineBanner message={entriesMessages.newEntry.offline} />}
        footer={
          <EditFooter
            isOnline={isOnline}
            isBlocked={Boolean(plan?.closedAt) || (isSpending(entryType) && shareTotals.isOver)}
            problem={problem}
            onCancel={() => (isDirty ? setIsDiscarding(true) : onClose())}
          />
        }
      >
        {isConflict && <EntryConflict workspaceId={workspaceId} />}
        <VersionNote changed={changed} />
        <EntryFormFields
          workspaceId={workspaceId}
          entryType={entryType}
          canSeeMembers={hasPermission(permissions, 'members', 'view')}
          canSeeContacts={hasPermission(permissions, 'contacts', 'view')}
          canCreateAccounts={hasPermission(permissions, 'accounts', 'create')}
          canCreateCards={hasPermission(permissions, 'cards', 'create')}
          isNewForm={false}
          autoFill={autoFill}
          amountInput={amountInput}
          amountWarning={amountWarning}
          plan={plan}
          today={today}
          currentUserName={currentUserName}
          shareTotals={shareTotals}
          onTypeChange={(next: FormEntryType) => changeEntryType(form, entryType, next)}
        />
      </FormOverlay>
      <DiscardDialog isOpen={isDiscarding} onOpenChange={setIsDiscarding} onDiscard={onClose} />
    </FormProvider>
  )
}

function LockedEntryEdit({ workspaceId, entry, locked, onClose, onSaved }: LockedEntryEditProps) {
  const isOnline = useIsOnline()
  const change = useChangeEntry(workspaceId)
  const [problem, setProblem] = useState<string | null>(null)
  const [isConflict, setIsConflict] = useState(false)
  const [isDiscarding, setIsDiscarding] = useState(false)
  const form = useSchemaForm({
    schema: entryDetailsFormSchema,
    requiredMessages: entriesMessages.required,
    defaultValues: { description: entry.description, notes: entry.notes ?? '' },
  })
  const { isDirty } = useFormState({ control: form.control })

  async function save(values: EntryDetailsFormValues) {
    setProblem(null)
    try {
      await change.mutateAsync({ mode: 'details', entryId: entry.id, ...values })
      showToast(messages.saved, { tone: 'success' })
      onSaved(entry.id)
    } catch (error) {
      if (error instanceof ApiError && error.code === CONFLICT) {
        setIsConflict(true)
        return
      }
      setProblem(errorMessageFor(error))
    }
  }

  return (
    <FormProvider {...form}>
      <FormOverlay
        title={messages.title}
        closeLabel={messages.close}
        isOpen
        onRequestClose={() => (isDirty ? setIsDiscarding(true) : onClose())}
        onSubmit={form.handleSubmit(save)}
        banner={<OfflineBanner message={entriesMessages.newEntry.offline} />}
        footer={
          <EditFooter
            isOnline={isOnline}
            isBlocked={false}
            problem={problem}
            onCancel={() => (isDirty ? setIsDiscarding(true) : onClose())}
          />
        }
      >
        <div className="flex flex-col gap-4.5 px-4 pt-3.5 lg:px-8">
          {isConflict && <EntryConflict workspaceId={workspaceId} />}
          <Alert tone="info" icon="lock">
            {entriesMessages.list.detail.closedNote}
          </Alert>
          <FormField<EntryDetailsFormValues>
            name="description"
            label={fields.description}
            isRequired
          >
            {(control) => <TextInput {...control} />}
          </FormField>
          <FormField<EntryDetailsFormValues> name="notes" label={fields.notes} maxLength={2000}>
            {(control) => <TextArea {...control} />}
          </FormField>
          <LockedField
            label={messages.unchanged}
            value={locked.title}
            detail={locked.detail}
            help={locked.reason}
          />
        </div>
      </FormOverlay>
      <DiscardDialog isOpen={isDiscarding} onOpenChange={setIsDiscarding} onDiscard={onClose} />
    </FormProvider>
  )
}

function VersionNote({ changed }: VersionNoteProps) {
  if (changed.length === 0) {
    return null
  }
  const names = [...new Set(changed.map((field) => changedNames[field] ?? field))]
  const what =
    names.length === 1
      ? (names[0] ?? '')
      : `${names.slice(0, -1).join(', ')}${messages.and}${names.at(-1)}`
  return (
    <div className="px-4 pt-3.5 lg:px-8">
      <Alert tone="info" icon="info">
        {messages.newVersion(what)}
      </Alert>
    </div>
  )
}

function EntryConflict({ workspaceId }: EntryConflictProps) {
  return (
    <div className="px-4 pt-3.5 lg:px-8">
      <Alert
        tone="danger"
        isUrgent
        action={
          <Button
            variant="subtle"
            size="sm"
            render={<Link to="/w/$workspaceId/entries" params={{ workspaceId }} />}
          >
            {messages.seeCurrent}
          </Button>
        }
      >
        {messages.conflict}
      </Alert>
    </div>
  )
}

function EditFooter({ isOnline, isBlocked, problem, onCancel }: EditFooterProps) {
  return (
    <>
      {problem && (
        <Alert tone="danger" isUrgent>
          {problem}
        </Alert>
      )}
      <div className="flex flex-col lg:flex-row-reverse lg:items-center lg:gap-2.5">
        <SubmitButton
          width="full"
          className="lg:w-auto"
          loadingLabel={messages.saving}
          requiresChange
          isBlocked={!isOnline || isBlocked}
        >
          {messages.save}
        </SubmitButton>
        <Button variant="quiet" className="mr-auto hidden lg:inline-flex" onClick={onCancel}>
          {messages.cancel}
        </Button>
      </div>
    </>
  )
}

function DiscardDialog({ isOpen, onOpenChange, onDiscard }: DiscardDialogProps) {
  return (
    <ConfirmDialog
      title={messages.discard.title}
      description={messages.discard.text}
      cancelLabel={messages.discard.keep}
      confirmLabel={messages.discard.confirm}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      onConfirm={onDiscard}
    />
  )
}

function changedOf(dirtyFields: Partial<Record<keyof EntryFormInput, unknown>>): string[] {
  return Object.entries(dirtyFields)
    .filter(([field, isDirty]) => Boolean(isDirty) && !IN_PLACE.has(field))
    .map(([field]) => field)
}
