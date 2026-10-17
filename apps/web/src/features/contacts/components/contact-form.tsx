import {
  CONTACT_NAME_MAX_LENGTH,
  CONTACT_NOTES_MAX_LENGTH,
  PIX_KEY_MAX_LENGTH,
} from '@financas/shared'
import { ConfirmDialog } from '@web/components/feedback/confirm-dialog'
import { OfflineBanner } from '@web/components/feedback/offline-banner'
import { showToast } from '@web/components/feedback/toast'
import { FormField } from '@web/components/forms/form-field'
import { Switch } from '@web/components/inputs/switch'
import { TextArea } from '@web/components/inputs/text-area'
import { TextInput } from '@web/components/inputs/text-input'
import { FormOverlay } from '@web/components/layout/form-overlay'
import { useSaveContact } from '@web/features/contacts/api/use-save-contact'
import { ContactFormFooter } from '@web/features/contacts/components/contact-form-footer'
import {
  contactChangeOf,
  contactDefaultsOf,
  newContactOf,
} from '@web/features/contacts/components/contact-input'
import { ContactPhoneField } from '@web/features/contacts/components/contact-phone-field'
import { contactsMessages } from '@web/features/contacts/contacts.messages'
import { contactFormSchema } from '@web/features/contacts/contacts.schemas'
import type {
  ContactFormInput,
  ContactFormProps,
  ContactFormValues,
  SaveContactRequest,
} from '@web/features/contacts/contacts.types'
import { useIsOnline } from '@web/hooks/use-is-online'
import { ApiError } from '@web/lib/api/api-error'
import { errorMessageFor } from '@web/lib/errors/error-message'
import { fill } from '@web/lib/format/template'
import { useSchemaForm } from '@web/lib/forms/use-schema-form'
import { useRef, useState } from 'react'
import { Controller, FormProvider, useFormState } from 'react-hook-form'

const messages = contactsMessages.form
const FIELD_OF_CODE: Partial<Record<string, keyof ContactFormInput>> = {
  CONTACT_PHONE_TAKEN: 'phone',
  CONTACT_EMAIL_TAKEN: 'email',
}

export function ContactForm({ workspaceId, contact, onClose, onCreated }: ContactFormProps) {
  const isOnline = useIsOnline()
  const saveContact = useSaveContact(workspaceId)
  const [problem, setProblem] = useState<string | null>(null)
  const [isDiscarding, setIsDiscarding] = useState(false)
  const nameInput = useRef<HTMLInputElement>(null)
  const form = useSchemaForm({
    schema: contactFormSchema,
    requiredMessages: messages.required,
    defaultValues: contactDefaultsOf(contact),
  })
  const { isDirty, dirtyFields } = useFormState({ control: form.control })
  const isEditing = contact !== null

  function requestClose() {
    if (isDirty) {
      setIsDiscarding(true)
      return
    }
    onClose()
  }

  async function save(values: ContactFormValues) {
    setProblem(null)
    try {
      const request: SaveContactRequest = contact
        ? { kind: 'edit', contactId: contact.id, change: contactChangeOf(values, dirtyFields) }
        : { kind: 'create', input: newContactOf(values) }
      const contactId = await saveContact.mutateAsync(request)
      if (contact) {
        showToast(messages.saved, { tone: 'success' })
        onClose()
        return
      }
      showToast(messages.created, { tone: 'success' })
      onCreated(contactId)
    } catch (error) {
      showProblem(error)
    }
  }

  function showProblem(error: unknown) {
    const field = error instanceof ApiError ? FIELD_OF_CODE[error.code] : undefined
    if (field) {
      form.setError(
        field,
        { type: 'server', message: errorMessageFor(error) },
        { shouldFocus: true },
      )
      return
    }
    const ref = error instanceof ApiError && error.isServerError ? error.ref : null
    setProblem(ref ? fill(messages.failed, { ref }) : errorMessageFor(error))
  }

  return (
    <FormProvider {...form}>
      <FormOverlay
        title={isEditing ? messages.editTitle : messages.newTitle}
        closeLabel={messages.close}
        size="roomy"
        actions="single"
        isOpen
        onRequestClose={requestClose}
        onSubmit={form.handleSubmit(save)}
        initialFocus={isEditing ? undefined : nameInput}
        banner={<OfflineBanner message={messages.offline} />}
        footer={
          <ContactFormFooter
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
        <div className="flex flex-col gap-4.5 px-4 pt-2.5 lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-6 lg:px-8">
          <div className="lg:col-span-2">
            <FormField<ContactFormInput>
              name="name"
              label={messages.name}
              isRequired
              maxLength={CONTACT_NAME_MAX_LENGTH}
            >
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
          </div>
          <ContactPhoneField />
          <FormField<ContactFormInput>
            name="email"
            label={messages.email}
            help={messages.emailHelp}
            helpGap="roomy"
          >
            {(control) => (
              <TextInput
                type="email"
                inputMode="email"
                autoComplete="off"
                placeholder={messages.emailPlaceholder}
                {...control}
              />
            )}
          </FormField>
          <div className="lg:col-span-2">
            <FormField<ContactFormInput>
              name="pixKey"
              label={messages.pixKey}
              help={messages.pixKeyHelp}
              helpGap="roomy"
              maxLength={PIX_KEY_MAX_LENGTH}
            >
              {(control) => (
                <TextInput
                  autoComplete="off"
                  placeholder={messages.pixKeyPlaceholder}
                  {...control}
                />
              )}
            </FormField>
          </div>
          <div className="lg:col-span-2">
            <FormField<ContactFormInput>
              name="notes"
              label={messages.notes}
              maxLength={CONTACT_NOTES_MAX_LENGTH}
            >
              {(control) => <TextArea {...control} />}
            </FormField>
          </div>
          {isEditing && (
            <div className="lg:col-span-2">
              <Controller
                control={form.control}
                name="isOptedOut"
                render={({ field }) => (
                  <Switch
                    label={messages.optedOut}
                    help={messages.optedOutHelp}
                    isChecked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>
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
