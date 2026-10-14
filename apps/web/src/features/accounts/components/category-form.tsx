import { ConfirmDialog } from '@web/components/feedback/confirm-dialog'
import { OfflineBanner } from '@web/components/feedback/offline-banner'
import { showToast } from '@web/components/feedback/toast'
import { FieldGroup } from '@web/components/forms/field-group'
import { FormField } from '@web/components/forms/form-field'
import { LockedField } from '@web/components/forms/locked-field'
import { ChoiceChips } from '@web/components/inputs/choice-chips'
import { ColorPicker } from '@web/components/inputs/color-picker'
import { IllustrationPicker } from '@web/components/inputs/illustration-picker'
import { RadioCardList } from '@web/components/inputs/radio-card-list'
import { TextInput } from '@web/components/inputs/text-input'
import { FormOverlay } from '@web/components/layout/form-overlay'
import { accountsMessages } from '@web/features/accounts/accounts.messages'
import { categoryFormSchema } from '@web/features/accounts/accounts.schemas'
import type {
  AccountChangeRequest,
  CategoryFormInput,
  CategoryFormProps,
  CategoryFormValues,
  CategoryKind,
  ParentSectionProps,
  SaveAccountRequest,
} from '@web/features/accounts/accounts.types'
import { useSaveAccount } from '@web/features/accounts/api/use-save-account'
import { AccountFormFooter } from '@web/features/accounts/components/account-form-footer'
import { namesList } from '@web/features/accounts/components/category-tree'
import { ParentField } from '@web/features/accounts/components/parent-field'
import { useIsOnline } from '@web/hooks/use-is-online'
import { ApiError } from '@web/lib/api/api-error'
import { errorMessageFor } from '@web/lib/errors/error-message'
import { fill } from '@web/lib/format/template'
import { useSchemaForm } from '@web/lib/forms/use-schema-form'
import { useRef, useState } from 'react'
import { Controller, FormProvider, useFormState, useWatch } from 'react-hook-form'

const messages = accountsMessages.categoryForm
const shared = accountsMessages.form
const FIELD_OF_CODE: Readonly<Record<string, keyof CategoryFormInput>> = {
  ACCOUNT_NAME_TAKEN: 'name',
  PARENT_NOT_AVAILABLE: 'parentId',
  PARENT_OF_ANOTHER_CLASS: 'parentId',
}
const KIND_OPTIONS = [
  { value: 'expense', label: messages.kinds.expense },
  { value: 'income', label: messages.kinds.income },
]
const ACCOUNT_KIND: Readonly<Record<CategoryKind, 'expense_category' | 'income_category'>> = {
  expense: 'expense_category',
  income: 'income_category',
}

export function CategoryForm({
  workspaceId,
  mode,
  mains,
  defaults,
  onClose,
  onCreated,
}: CategoryFormProps) {
  const isOnline = useIsOnline()
  const saveAccount = useSaveAccount(workspaceId)
  const [problem, setProblem] = useState<string | null>(null)
  const [isDiscarding, setIsDiscarding] = useState(false)
  const nameInput = useRef<HTMLInputElement>(null)
  const form = useSchemaForm({
    schema: categoryFormSchema,
    requiredMessages: { ...messages.required },
    defaultValues: defaults,
  })
  const { isDirty, dirtyFields } = useFormState({ control: form.control })
  const [kind, name] = useWatch({ control: form.control, name: ['kind', 'name'] })
  const isEditing = mode.kind === 'edit'
  const shownName = name || (mode.kind === 'edit' ? mode.node.name : '')

  function requestClose() {
    if (isDirty) {
      setIsDiscarding(true)
      return
    }
    onClose()
  }

  async function save(values: CategoryFormValues) {
    setProblem(null)
    try {
      const request: SaveAccountRequest =
        mode.kind === 'edit'
          ? { kind: 'edit', accountId: mode.node.id, change: changeOf(values, dirtyFields) }
          : { kind: 'create', input: newCategoryOf(values) }
      const accountId = await saveAccount.mutateAsync(request)
      if (mode.kind === 'edit') {
        showToast(shared.saved, { tone: 'success' })
        onClose()
        return
      }
      showToast(messages.created(values.name), { tone: 'success' })
      onCreated(accountId, values.kind)
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
    const ref = error instanceof ApiError ? error.ref : null
    setProblem(ref ? fill(messages.failed, { ref }) : errorMessageFor(error))
  }

  return (
    <FormProvider {...form}>
      <FormOverlay
        title={isEditing ? messages.editTitle : messages.newTitle}
        closeLabel={shared.close}
        size="md"
        actions="single"
        isOpen
        onRequestClose={requestClose}
        onSubmit={form.handleSubmit(save)}
        initialFocus={isEditing ? undefined : nameInput}
        banner={<OfflineBanner message={shared.offline} />}
        footer={
          <AccountFormFooter
            isEditing={isEditing}
            isOnline={isOnline}
            problem={problem}
            onCancel={requestClose}
            labels={{ create: messages.create, creating: messages.creating }}
          />
        }
      >
        <p className="mx-4 mt-3.5 text-note text-ink-muted lg:mx-8">
          <span aria-hidden="true" className="font-semibold text-danger">
            {shared.requiredMark}
          </span>{' '}
          {shared.requiredLegend}
        </p>
        <div className="flex flex-col gap-4.5 px-4 pt-2.5 lg:px-8">
          {isEditing ? (
            <LockedField label={shared.kind} value={messages.kinds[kind]} help={shared.kindHelp} />
          ) : (
            <Controller
              control={form.control}
              name="kind"
              render={({ field }) => (
                <FieldGroup label={shared.kind} isRequired help={shared.kindHelp}>
                  <ChoiceChips
                    label={shared.kind}
                    options={KIND_OPTIONS}
                    value={field.value}
                    onSelect={(next) => {
                      field.onChange(next)
                      form.setValue('parentId', '')
                      form.setValue('incomeNature', '')
                    }}
                    onBlur={field.onBlur}
                  />
                </FieldGroup>
              )}
            />
          )}
          <FormField<CategoryFormInput> name="name" label={shared.name} isRequired maxLength={80}>
            {(control) => (
              <TextInput
                autoComplete="off"
                placeholder={isEditing ? undefined : messages.namePlaceholder[kind]}
                {...control}
                ref={(element) => {
                  nameInput.current = element
                  control.ref(element)
                }}
              />
            )}
          </FormField>
          {kind === 'income' && !isEditing && (
            <Controller
              control={form.control}
              name="incomeNature"
              render={({ field, fieldState }) => (
                <FieldGroup
                  label={messages.nature}
                  isRequired
                  help={messages.natureHelp}
                  error={fieldState.error?.message}
                >
                  <RadioCardList
                    label={messages.nature}
                    layout="pair"
                    options={messages.natures}
                    value={field.value || null}
                    onSelect={field.onChange}
                    onBlur={field.onBlur}
                  />
                </FieldGroup>
              )}
            />
          )}
          <ParentSection mode={mode} kind={kind} mains={mains} name={shownName} />
          <Controller
            control={form.control}
            name="icon"
            render={({ field }) => (
              <FieldGroup label={shared.illustration}>
                <IllustrationPicker
                  label={shared.illustration}
                  name={name || messages.kinds[kind]}
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
              <FieldGroup label={shared.color} help={shared.colorHelp}>
                <ColorPicker
                  label={shared.color}
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
        title={shared.discard.title}
        description={messages.discardText}
        cancelLabel={shared.discard.keep}
        confirmLabel={shared.discard.confirm}
        isOpen={isDiscarding}
        onOpenChange={setIsDiscarding}
        onConfirm={onClose}
      />
    </FormProvider>
  )
}

function newCategoryOf(values: CategoryFormValues) {
  return {
    kind: ACCOUNT_KIND[values.kind],
    name: values.name,
    parentId: values.parentId || null,
    incomeNature: values.kind === 'income' && values.incomeNature ? values.incomeNature : null,
    icon: values.icon || null,
    color: values.color || null,
  }
}

function changeOf(
  values: CategoryFormValues,
  dirty: Partial<Record<keyof CategoryFormInput, boolean>>,
): AccountChangeRequest {
  return {
    ...(dirty.name && { name: values.name }),
    ...(dirty.parentId && { parentId: values.parentId || null }),
    ...(dirty.icon && { icon: values.icon || null }),
    ...(dirty.color && { color: values.color || null }),
  }
}

function ParentSection({ mode, kind, mains, name }: ParentSectionProps) {
  const children = mode.kind === 'edit' ? mode.node.children : []
  if (children.length > 0) {
    return (
      <LockedField
        label={messages.parent}
        value={messages.none}
        help={messages.parentLocked(name, namesList(children.map((child) => child.name)))}
      />
    )
  }
  const editedId = mode.kind === 'edit' ? mode.node.id : null
  const isChild = mode.kind === 'edit' && mode.node.parentId !== null
  return (
    <ParentField
      kind={kind}
      mains={mains[kind].filter((main) => main.id !== editedId)}
      help={isChild ? messages.parentHelp(name) : undefined}
    />
  )
}
