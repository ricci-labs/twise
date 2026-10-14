import { MONEY_ACCOUNT_KINDS } from '@financas/shared'
import { ConfirmDialog } from '@web/components/feedback/confirm-dialog'
import { OfflineBanner } from '@web/components/feedback/offline-banner'
import { showToast } from '@web/components/feedback/toast'
import { FieldGroup } from '@web/components/forms/field-group'
import { FormField } from '@web/components/forms/form-field'
import { LockedField } from '@web/components/forms/locked-field'
import { ChoiceChips } from '@web/components/inputs/choice-chips'
import { ColorPicker } from '@web/components/inputs/color-picker'
import { IllustrationPicker } from '@web/components/inputs/illustration-picker'
import { TextInput } from '@web/components/inputs/text-input'
import { FormOverlay } from '@web/components/layout/form-overlay'
import { accountsMessages } from '@web/features/accounts/accounts.messages'
import { accountFormSchema } from '@web/features/accounts/accounts.schemas'
import type {
  AccountChangeRequest,
  AccountFormInput,
  AccountFormProps,
  AccountFormValues,
  SaveAccountRequest,
  WorkspaceMember,
} from '@web/features/accounts/accounts.types'
import { useSaveAccount } from '@web/features/accounts/api/use-save-account'
import { AccountFormFooter } from '@web/features/accounts/components/account-form-footer'
import { useIsOnline } from '@web/hooks/use-is-online'
import { ApiError } from '@web/lib/api/api-error'
import { errorMessageFor } from '@web/lib/errors/error-message'
import { fill } from '@web/lib/format/template'
import { useSchemaForm } from '@web/lib/forms/use-schema-form'
import { useRef, useState } from 'react'
import { Controller, FormProvider, useFormState, useWatch } from 'react-hook-form'

const messages = accountsMessages.form
const NAME_TAKEN = 'ACCOUNT_NAME_TAKEN'
const HOUSEHOLD = ''
const KIND_OPTIONS = MONEY_ACCOUNT_KINDS.map((kind) => ({
  value: kind,
  label: accountsMessages.kinds[kind],
}))

export function AccountForm({
  workspaceId,
  mode,
  members,
  defaults,
  onClose,
  onCreated,
}: AccountFormProps) {
  const isOnline = useIsOnline()
  const saveAccount = useSaveAccount(workspaceId)
  const [problem, setProblem] = useState<string | null>(null)
  const [isDiscarding, setIsDiscarding] = useState(false)
  const nameInput = useRef<HTMLInputElement>(null)
  const form = useSchemaForm({
    schema: accountFormSchema,
    requiredMessages: messages.required,
    defaultValues: defaults,
  })
  const { isDirty, dirtyFields } = useFormState({ control: form.control })
  const [kind, name] = useWatch({ control: form.control, name: ['kind', 'name'] })
  const isEditing = mode.kind === 'edit'

  function requestClose() {
    if (isDirty) {
      setIsDiscarding(true)
      return
    }
    onClose()
  }

  async function save(values: AccountFormValues) {
    setProblem(null)
    try {
      const request: SaveAccountRequest =
        mode.kind === 'edit'
          ? { kind: 'edit', accountId: mode.account.id, change: changeOf(values, dirtyFields) }
          : { kind: 'create', input: newAccountOf(values) }
      const accountId = await saveAccount.mutateAsync(request)
      if (mode.kind === 'edit') {
        showToast(messages.saved, { tone: 'success' })
        onClose()
        return
      }
      showToast(messages.created(values.name), { tone: 'success' })
      onCreated(accountId)
    } catch (error) {
      showProblem(error)
    }
  }

  function showProblem(error: unknown) {
    if (error instanceof ApiError && error.code === NAME_TAKEN) {
      form.setError(
        'name',
        { type: 'server', message: errorMessageFor(error) },
        { shouldFocus: true },
      )
      return
    }
    const ref = error instanceof ApiError ? error.ref : null
    setProblem(ref ? fill(messages.failed, { ref }) : errorMessageFor(error))
  }

  return (
    <FormProvider {...form}>
      <FormOverlay
        title={isEditing ? messages.editTitle : messages.newTitle}
        closeLabel={messages.close}
        size="md"
        actions="single"
        isOpen
        onRequestClose={requestClose}
        onSubmit={form.handleSubmit(save)}
        initialFocus={isEditing ? undefined : nameInput}
        banner={<OfflineBanner message={messages.offline} />}
        footer={
          <AccountFormFooter
            isEditing={isEditing}
            isOnline={isOnline}
            problem={problem}
            onCancel={requestClose}
          />
        }
      >
        <p className="mx-4 mt-3.5 text-note text-ink-muted lg:mx-8">
          <span aria-hidden="true" className="font-semibold text-danger">
            {messages.requiredMark}
          </span>{' '}
          {messages.requiredLegend}
        </p>
        <div className="flex flex-col gap-4.5 px-4 pt-2.5 lg:px-8">
          {mode.kind === 'edit' ? (
            <LockedField
              label={messages.kind}
              value={accountsMessages.kinds[kind]}
              help={messages.kindHelp}
            />
          ) : (
            <Controller
              control={form.control}
              name="kind"
              render={({ field }) => (
                <FieldGroup label={messages.kind} isRequired help={messages.kindHelp}>
                  <ChoiceChips
                    label={messages.kind}
                    options={KIND_OPTIONS}
                    value={field.value}
                    onSelect={field.onChange}
                    onBlur={field.onBlur}
                  />
                </FieldGroup>
              )}
            />
          )}
          <FormField<AccountFormInput> name="name" label={messages.name} isRequired maxLength={80}>
            {(control) => (
              <TextInput
                autoComplete="off"
                placeholder={messages.namePlaceholder}
                {...control}
                ref={(element) => {
                  nameInput.current = element
                  control.ref(element)
                }}
              />
            )}
          </FormField>
          {members && (
            <Controller
              control={form.control}
              name="ownerUserId"
              render={({ field }) => (
                <FieldGroup label={messages.owner}>
                  <ChoiceChips
                    label={messages.owner}
                    variant="member"
                    options={ownerOptionsOf(members)}
                    value={field.value}
                    onSelect={field.onChange}
                    onBlur={field.onBlur}
                  />
                </FieldGroup>
              )}
            />
          )}
          <Controller
            control={form.control}
            name="icon"
            render={({ field }) => (
              <FieldGroup label={messages.illustration}>
                <IllustrationPicker
                  label={messages.illustration}
                  name={name || accountsMessages.kinds[kind]}
                  value={field.value}
                  onSelect={field.onChange}
                  onBlur={field.onBlur}
                />
              </FieldGroup>
            )}
          />
          <Controller
            control={form.control}
            name="color"
            render={({ field }) => (
              <FieldGroup label={messages.color} help={messages.colorHelp}>
                <ColorPicker
                  label={messages.color}
                  value={field.value}
                  onSelect={field.onChange}
                  onBlur={field.onBlur}
                />
              </FieldGroup>
            )}
          />
        </div>
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

function ownerOptionsOf(members: readonly WorkspaceMember[]) {
  return [
    ...members.map((member) => ({
      value: member.userId,
      label: member.displayName,
      avatarName: member.displayName,
    })),
    {
      value: HOUSEHOLD,
      label: messages.household,
      avatarName: messages.household,
      avatarIcon: 'home' as const,
    },
  ]
}

function newAccountOf(values: AccountFormValues) {
  return {
    kind: values.kind,
    name: values.name,
    ownerUserId: values.ownerUserId || null,
    icon: values.icon || null,
    color: values.color || null,
  }
}

function changeOf(
  values: AccountFormValues,
  dirty: Partial<Record<keyof AccountFormInput, boolean>>,
): AccountChangeRequest {
  return {
    ...(dirty.name && { name: values.name }),
    ...(dirty.ownerUserId && { ownerUserId: values.ownerUserId || null }),
    ...(dirty.icon && { icon: values.icon || null }),
    ...(dirty.color && { color: values.color || null }),
  }
}
