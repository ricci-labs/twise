import {
  PIX_KEY_MAX_LENGTH,
  PIX_RECEIVER_CITY_MAX_LENGTH,
  PIX_RECEIVER_NAME_MAX_LENGTH,
  type PixReceiving,
} from '@financas/shared'
import { Button } from '@web/components/actions/button'
import { CategoryArt } from '@web/components/display/category-art'
import { RichText } from '@web/components/display/rich-text'
import { Alert } from '@web/components/feedback/alert'
import { ConfirmDialog } from '@web/components/feedback/confirm-dialog'
import { showToast } from '@web/components/feedback/toast'
import { Form } from '@web/components/forms/form'
import { FormField } from '@web/components/forms/form-field'
import { SubmitButton } from '@web/components/forms/submit-button'
import { TwiseIcon } from '@web/components/icons/twise-icon'
import { TextInput } from '@web/components/inputs/text-input'
import { useSetPixReceiving } from '@web/features/settings/api/use-set-pix-receiving'
import { settingsMessages } from '@web/features/settings/settings.messages'
import { pixFormSchema } from '@web/features/settings/settings.schemas'
import type {
  PixBankPreviewProps,
  PixFormInput,
  PixSettingsFormProps,
  WorkspaceSettings,
} from '@web/features/settings/settings.types'
import { ApiError } from '@web/lib/api/api-error'
import { errorMessageFor } from '@web/lib/errors/error-message'
import { useSchemaForm } from '@web/lib/forms/use-schema-form'
import { useState } from 'react'
import { useWatch } from 'react-hook-form'

const messages = settingsMessages.pix
const PIX_INVALID = 'PIX_INVALID'
const NO_PIX: PixFormInput = { key: '', receiverName: '', receiverCity: '' }

export function PixSettingsForm({ workspaceId, settings, canUpdate, lead }: PixSettingsFormProps) {
  const setPix = useSetPixReceiving(workspaceId)
  const [problem, setProblem] = useState<string | null>(null)
  const [isRemoving, setIsRemoving] = useState(false)
  const [hasPix, setHasPix] = useState(settings.pixReceivingKey !== null)
  const form = useSchemaForm({
    schema: pixFormSchema,
    requiredMessages: messages.required,
    defaultValues: pixFormValuesOf(settings),
  })

  async function save(pix: NonNullable<PixReceiving>) {
    setProblem(null)
    try {
      await setPix.mutateAsync(pix)
      form.reset(pix)
      setHasPix(true)
      showToast(messages.saved, { tone: 'success' })
    } catch (error) {
      await showProblem(error)
    }
  }

  async function showProblem(error: unknown) {
    const isFieldProblem =
      error instanceof ApiError &&
      error.code === PIX_INVALID &&
      !(await form.trigger(undefined, { shouldFocus: true }))
    if (!isFieldProblem) {
      setProblem(errorMessageFor(error))
    }
  }

  async function confirmRemove() {
    try {
      await setPix.mutateAsync(null)
      setIsRemoving(false)
      form.reset(NO_PIX)
      setHasPix(false)
      showToast(messages.removed, { tone: 'success' })
    } catch (error) {
      showToast(errorMessageFor(error), { tone: 'danger' })
    }
  }

  if (!canUpdate && !hasPix) {
    return <p className="text-body-sm text-ink-muted">{messages.notConfigured}</p>
  }
  return (
    <Form form={form} onSubmit={save} className="flex flex-col gap-5">
      {canUpdate && <RequiredLegend />}
      {lead && <p className="-mt-2 text-body-sm text-ink-muted">{lead}</p>}
      <FormField<PixFormInput>
        name="key"
        label={messages.key}
        isRequired
        isReadOnly={!canUpdate}
        maxLength={PIX_KEY_MAX_LENGTH}
      >
        {(control) => (
          <TextInput autoComplete="off" placeholder={messages.keyPlaceholder} {...control} />
        )}
      </FormField>
      <FormField<PixFormInput>
        name="receiverName"
        label={messages.receiverName}
        help={messages.receiverNameHelp}
        isRequired
        isReadOnly={!canUpdate}
        maxLength={PIX_RECEIVER_NAME_MAX_LENGTH}
      >
        {(control) => <TextInput autoComplete="off" {...control} />}
      </FormField>
      <FormField<PixFormInput>
        name="receiverCity"
        label={messages.receiverCity}
        isRequired
        isReadOnly={!canUpdate}
        maxLength={PIX_RECEIVER_CITY_MAX_LENGTH}
      >
        {(control) => <TextInput autoComplete="off" {...control} />}
      </FormField>
      <WatchedBankPreview />
      {canUpdate && hasPix && (
        <Button
          variant="dangerText"
          className="-ml-3 self-start"
          onClick={() => setIsRemoving(true)}
        >
          <TwiseIcon name="trash" size="sm" />
          {messages.remove}
        </Button>
      )}
      {problem && (
        <Alert tone="danger" isUrgent>
          {problem}
        </Alert>
      )}
      {canUpdate && (
        <SubmitButton
          requiresChange
          loadingLabel={messages.saving}
          width="full"
          className="lg:w-auto lg:self-start"
        >
          {messages.save}
        </SubmitButton>
      )}
      <ConfirmDialog
        title={messages.removeTitle}
        description={messages.removeText}
        cancelLabel={messages.cancel}
        confirmLabel={messages.remove}
        confirmVariant="danger"
        isOpen={isRemoving}
        onOpenChange={setIsRemoving}
        onConfirm={() => void confirmRemove()}
      />
    </Form>
  )
}

function RequiredLegend() {
  return (
    <p className="text-note text-ink-muted">
      <span aria-hidden="true" className="font-semibold text-danger">
        {messages.requiredMark}
      </span>{' '}
      {messages.requiredLegend}
    </p>
  )
}

function WatchedBankPreview() {
  const [receiverName, receiverCity] = useWatch<PixFormInput, ['receiverName', 'receiverCity']>({
    name: ['receiverName', 'receiverCity'],
  })
  return <PixBankPreview receiverName={receiverName} receiverCity={receiverCity} />
}

function PixBankPreview({ receiverName, receiverCity }: PixBankPreviewProps) {
  const name = receiverName.trim()
  const city = receiverCity.trim()
  if (name === '' || city === '') {
    return null
  }
  return (
    <div role="status" className="flex items-start gap-3 rounded-lg bg-sunken px-3.5 py-3">
      <CategoryArt name={messages.previewTitle} icon="coin" size="md" />
      <div className="flex flex-1 flex-col pt-0.5 text-label font-normal text-ink">
        <p>{messages.previewTitle}</p>
        <p>
          <RichText text={messages.previewText} values={{ nome: name, cidade: city }} />
        </p>
      </div>
    </div>
  )
}

function pixFormValuesOf(settings: WorkspaceSettings): PixFormInput {
  return {
    key: settings.pixReceivingKey ?? '',
    receiverName: settings.pixReceiverName ?? '',
    receiverCity: settings.pixReceiverCity ?? '',
  }
}
