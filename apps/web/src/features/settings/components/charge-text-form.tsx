import {
  CHARGE_TEXT_LIMITS,
  type ChargeTag,
  type ChargeTextField,
  unknownChargeTags,
} from '@financas/shared'
import { Button } from '@web/components/actions/button'
import { Alert } from '@web/components/feedback/alert'
import { ConfirmDialog } from '@web/components/feedback/confirm-dialog'
import { showToast } from '@web/components/feedback/toast'
import { Form } from '@web/components/forms/form'
import { FormField } from '@web/components/forms/form-field'
import { SubmitButton } from '@web/components/forms/submit-button'
import { TwiseIcon } from '@web/components/icons/twise-icon'
import { ChargeTagButtons, ChargeTextEditor } from '@web/components/inputs/charge-text-editor'
import { PageHeader } from '@web/components/layout/page-header'
import { useResetChargeText, useSaveChargeText } from '@web/features/settings/api/use-charge-text'
import {
  ChargeTextDesktopPreviews,
  ChargeTextPhonePreview,
  ChargeTextWhatsAppPreview,
} from '@web/features/settings/components/charge-text-preview'
import {
  chargeTextFormValuesOf,
  chargeTextPreviewsOf,
  chargeTextRequestOf,
} from '@web/features/settings/components/charge-text-views'
import { settingsMessages } from '@web/features/settings/settings.messages'
import { chargeTextFormSchema } from '@web/features/settings/settings.schemas'
import type {
  ChargeTextFieldProps,
  ChargeTextFieldsProps,
  ChargeTextFormInput,
  ChargeTextFormProps,
  ChargeTextLayoutProps,
} from '@web/features/settings/settings.types'
import { errorMessageFor } from '@web/lib/errors/error-message'
import { useSchemaForm } from '@web/lib/forms/use-schema-form'
import { useRef, useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

const messages = settingsMessages.chargeText
const DEFAULT_TAG_FIELD: ChargeTextField = 'opening'
const NO_ELEMENTS: Record<ChargeTextField, HTMLTextAreaElement | null> = {
  subject: null,
  opening: null,
  closing: null,
}

export function ChargeTextForm(props: ChargeTextFormProps) {
  const { workspaceId, saved, canUpdate } = props
  const save = useSaveChargeText(workspaceId)
  const reset = useResetChargeText(workspaceId)
  const [problem, setProblem] = useState<string | null>(null)
  const [isResetting, setIsResetting] = useState(false)
  const form = useSchemaForm({
    schema: chargeTextFormSchema,
    requiredMessages: messages.required,
    defaultValues: chargeTextFormValuesOf(saved),
  })

  async function submit(values: ChargeTextFormInput) {
    setProblem(null)
    try {
      const next = await save.mutateAsync(chargeTextRequestOf(values))
      form.reset(chargeTextFormValuesOf(next))
      showToast(messages.saved, { tone: 'success' })
    } catch (error) {
      setProblem(errorMessageFor(error))
    }
  }

  function confirmReset() {
    setIsResetting(false)
    reset.mutate(undefined, {
      onSuccess: () => showToast(messages.resetDone, { tone: 'success' }),
      onError: (error) => showToast(errorMessageFor(error), { tone: 'danger' }),
    })
  }

  const fields = (
    <ChargeTextFields
      canUpdate={canUpdate}
      footer={
        <>
          {canUpdate && !saved.isDefault && (
            <Button
              variant="tertiary"
              className="-ml-3 self-start"
              onClick={() => setIsResetting(true)}
            >
              <TwiseIcon name="restore" size="sm" />
              {messages.reset}
            </Button>
          )}
          {problem && (
            <Alert tone="danger" isUrgent>
              {problem}
            </Alert>
          )}
        </>
      }
    />
  )
  const submitButton = canUpdate && (
    <SubmitButton requiresChange loadingLabel={messages.saving} width="full" className="lg:w-auto">
      {messages.save}
    </SubmitButton>
  )
  return (
    <Form form={form} onSubmit={submit} className="flex flex-col gap-5">
      <ChargeTextLayout {...props} fields={fields} submitButton={submitButton} />
      <ConfirmDialog
        title={messages.resetTitle}
        description={messages.resetText}
        cancelLabel={messages.cancel}
        confirmLabel={messages.resetConfirm}
        confirmVariant="primary"
        isOpen={isResetting}
        onOpenChange={setIsResetting}
        onConfirm={confirmReset}
      />
    </Form>
  )
}

function ChargeTextLayout({
  workspaceName,
  requesterName,
  requesterEmail,
  settings,
  today,
  isDesktop,
  fields,
  submitButton,
}: ChargeTextLayoutProps) {
  const values = useWatch<ChargeTextFormInput>() as ChargeTextFormInput
  const previews = chargeTextPreviewsOf(values, {
    requesterName,
    requesterEmail,
    workspaceName,
    today,
    pix: settings,
  })
  if (!isDesktop) {
    return (
      <>
        {fields}
        <ChargeTextPhonePreview previews={previews} />
        <FixedParts />
        {submitButton}
      </>
    )
  }
  return (
    <>
      <PageHeader
        title={messages.title}
        description={messages.description}
        actions={submitButton}
      />
      <div className="grid grid-cols-2 items-start gap-6">
        <div className="flex flex-col gap-5 rounded-xl border border-border bg-surface p-6">
          <p className="text-body-sm text-ink-muted">{messages.lead(workspaceName)}</p>
          {fields}
          <FixedParts />
          <ChargeTextWhatsAppPreview previews={previews} />
        </div>
        <ChargeTextDesktopPreviews previews={previews} />
      </div>
    </>
  )
}

function ChargeTextFields({ canUpdate, footer }: ChargeTextFieldsProps) {
  const { getValues, setValue } = useFormContext<ChargeTextFormInput>()
  const elements = useRef({ ...NO_ELEMENTS })
  const tagField = useRef<ChargeTextField>(DEFAULT_TAG_FIELD)

  function insert(tag: ChargeTag) {
    const field = tagField.current
    const element = elements.current[field]
    const value = getValues(field)
    const start = element?.selectionStart ?? value.length
    const end = element?.selectionEnd ?? value.length
    setValue(field, `${value.slice(0, start)}${tag}${value.slice(end)}`, {
      shouldDirty: true,
      shouldValidate: true,
    })
    const caret = start + tag.length
    requestAnimationFrame(() => element?.setSelectionRange(caret, caret))
  }

  const fieldProps = {
    canUpdate,
    onFocus: (field: ChargeTextField) => {
      tagField.current = field
    },
    registerElement: (field: ChargeTextField, element: HTMLTextAreaElement | null) => {
      elements.current[field] = element
    },
  }
  return (
    <>
      <ChargeTextInput
        {...fieldProps}
        field="subject"
        label={messages.subject}
        help={messages.subjectHelp}
        isRequired
        isSingleLine
      />
      <ChargeTextInput
        {...fieldProps}
        field="opening"
        label={messages.opening}
        help={messages.openingHelp}
        isRequired
        isSingleLine={false}
      />
      {canUpdate && <ChargeTagButtons onInsert={insert} />}
      <ChargeTextInput
        {...fieldProps}
        field="closing"
        label={messages.closing}
        help={messages.closingHelp}
        isRequired={false}
        isSingleLine={false}
      />
      {footer}
    </>
  )
}

function ChargeTextInput({
  field,
  label,
  help,
  isRequired,
  isSingleLine,
  canUpdate,
  onFocus,
  registerElement,
}: ChargeTextFieldProps) {
  const { trigger, getFieldState } = useFormContext<ChargeTextFormInput>()
  return (
    <FormField<ChargeTextFormInput>
      name={field}
      label={label}
      help={help}
      isRequired={isRequired}
      isReadOnly={!canUpdate}
      maxLength={CHARGE_TEXT_LIMITS[field].maxLength}
    >
      {({ ref, onChange, ...control }) => (
        <ChargeTextEditor
          {...control}
          isSingleLine={isSingleLine}
          ref={(element) => {
            ref(element)
            registerElement(field, element)
          }}
          onFocus={() => onFocus(field)}
          onChange={(event) => {
            onChange(event)
            if (unknownChargeTags(event.target.value).length > 0 || getFieldState(field).error) {
              void trigger(field)
            }
          }}
        />
      )}
    </FormField>
  )
}

function FixedParts() {
  return (
    <div className="flex items-start gap-2.5 rounded-lg bg-sunken px-3.5 py-3">
      <TwiseIcon name="lock" size="sm" tone="muted" className="mt-0.5" />
      <div className="flex flex-col gap-0.5">
        <p className="font-semibold text-body-sm text-ink">{messages.fixedTitle}</p>
        <p className="text-note text-ink-muted">{messages.fixedText}</p>
      </div>
    </div>
  )
}
