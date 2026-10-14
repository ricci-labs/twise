import { ConfirmDialog } from '@web/components/feedback/confirm-dialog'
import { OfflineBanner } from '@web/components/feedback/offline-banner'
import { showToast } from '@web/components/feedback/toast'
import { FieldGroup } from '@web/components/forms/field-group'
import { FormField } from '@web/components/forms/form-field'
import { ChoiceChips } from '@web/components/inputs/choice-chips'
import { ColorPicker } from '@web/components/inputs/color-picker'
import { MoneyInput } from '@web/components/inputs/money-input'
import { Switch } from '@web/components/inputs/switch'
import { TextInput } from '@web/components/inputs/text-input'
import { FormOverlay } from '@web/components/layout/form-overlay'
import { accountsMessages } from '@web/features/accounts/accounts.messages'
import { cardFormSchema } from '@web/features/accounts/accounts.schemas'
import type {
  CardFormInput,
  CardFormProps,
  CardFormValues,
  SaveCardRequest,
} from '@web/features/accounts/accounts.types'
import { useSaveCard } from '@web/features/accounts/api/use-save-card'
import { AccountFormFooter } from '@web/features/accounts/components/account-form-footer'
import { CardDays } from '@web/features/accounts/components/card-days'
import { requestOf } from '@web/features/accounts/components/card-requests'
import { PaymentAccountField } from '@web/features/accounts/components/payment-account-field'
import { useIsOnline } from '@web/hooks/use-is-online'
import { ApiError } from '@web/lib/api/api-error'
import { errorMessageFor } from '@web/lib/errors/error-message'
import { fill } from '@web/lib/format/template'
import { useSchemaForm } from '@web/lib/forms/use-schema-form'
import { useRef, useState } from 'react'
import { Controller, FormProvider, useFormState } from 'react-hook-form'

const messages = accountsMessages.cardForm

const FIELD_OF_ERROR: Readonly<Record<string, keyof CardFormInput>> = {
  ACCOUNT_NAME_TAKEN: 'name',
  PAYMENT_ACCOUNT_NOT_AVAILABLE: 'paymentAccountId',
  HOLDER_NOT_A_MEMBER: 'holderUserId',
}

const FOOTER_LABELS = { create: messages.create, creating: messages.creating }

export function CardForm({
  workspaceId,
  mode,
  accounts,
  members,
  defaults,
  canRename,
  canChangeCycle,
  onClose,
  onCreated,
}: CardFormProps) {
  const isOnline = useIsOnline()
  const saveCard = useSaveCard(workspaceId)
  const [problem, setProblem] = useState<string | null>(null)
  const [isDiscarding, setIsDiscarding] = useState(false)
  const nameInput = useRef<HTMLInputElement>(null)
  const form = useSchemaForm({
    schema: cardFormSchema,
    requiredMessages: messages.required,
    defaultValues: defaults,
  })
  const { isDirty, dirtyFields } = useFormState({ control: form.control })
  const isEditing = mode.kind === 'edit'

  function requestClose() {
    if (isDirty) {
      setIsDiscarding(true)
      return
    }
    onClose()
  }

  async function save(values: CardFormValues) {
    setProblem(null)
    try {
      const request: SaveCardRequest = requestOf(mode, values, dirtyFields)
      const cardId = await saveCard.mutateAsync(request)
      if (mode.kind === 'edit') {
        showToast(messages.saved, { tone: 'success' })
        onClose()
        return
      }
      showToast(messages.created(values.name), { tone: 'success' })
      onCreated(cardId)
    } catch (error) {
      showProblem(error)
    }
  }

  function showProblem(error: unknown) {
    const field = error instanceof ApiError ? FIELD_OF_ERROR[error.code] : undefined
    if (field) {
      form.setError(
        field,
        { type: 'server', message: errorMessageFor(error) },
        { shouldFocus: true },
      )
      return
    }
    const ref = error instanceof ApiError ? error.ref : null
    setProblem(ref ? fill(messages.failed, { ref }) : errorMessageFor(error))
  }

  const focusName = !isEditing || (mode.kind === 'edit' && mode.part === 'name')
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
        initialFocus={focusName && canRename ? nameInput : undefined}
        banner={<OfflineBanner message={messages.offline} />}
        footer={
          <AccountFormFooter
            isEditing={isEditing}
            isOnline={isOnline}
            problem={problem}
            onCancel={requestClose}
            labels={FOOTER_LABELS}
          />
        }
      >
        <p className="mx-4 mt-3.5 text-note text-ink-muted lg:mx-8">
          <span aria-hidden="true" className="font-semibold text-danger">
            {accountsMessages.form.requiredMark}
          </span>{' '}
          {accountsMessages.form.requiredLegend}
        </p>
        <div className="flex flex-col gap-4.5 px-4 pt-2.5 lg:px-8">
          {canRename && (
            <FormField<CardFormInput> name="name" label={messages.name} isRequired maxLength={80}>
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
          )}
          {canChangeCycle && (
            <>
              <CardDays isEditing={isEditing} />
              <Controller
                control={form.control}
                name="purchaseOnClosingDayGoesNext"
                render={({ field }) => (
                  <Switch
                    label={messages.goesNext}
                    isChecked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <FormField<CardFormInput> name="limit" label={messages.limit}>
                {(control) => <MoneyInput size="lg" {...control} />}
              </FormField>
              <PaymentAccountField accounts={accounts} />
              {members && (
                <Controller
                  control={form.control}
                  name="holderUserId"
                  render={({ field, fieldState }) => (
                    <FieldGroup
                      label={messages.holder}
                      help={messages.holderHelp}
                      error={fieldState.error?.message}
                    >
                      <ChoiceChips
                        label={messages.holder}
                        variant="member"
                        options={members.map((member) => ({
                          value: member.userId,
                          label: member.displayName,
                          avatarName: member.displayName,
                        }))}
                        value={field.value}
                        onSelect={field.onChange}
                        onBlur={field.onBlur}
                      />
                    </FieldGroup>
                  )}
                />
              )}
            </>
          )}
          {canRename && (
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
          )}
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
