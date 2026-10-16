import {
  RECURRENCE_DESCRIPTION_MAX_LENGTH,
  RECURRING_ENTRY_TYPES,
  type RecurringEntryType,
} from '@financas/shared'
import { FieldGroup } from '@web/components/forms/field-group'
import { FormField } from '@web/components/forms/form-field'
import { ChoiceChips } from '@web/components/inputs/choice-chips'
import { MoneyInput } from '@web/components/inputs/money-input'
import { Switch } from '@web/components/inputs/switch'
import { TextInput } from '@web/components/inputs/text-input'
import { RecurrenceAccountFields } from '@web/features/planning/components/recurrence-accounts'
import {
  keepsCategoryAccount,
  keepsSourceAccount,
} from '@web/features/planning/components/recurrence-input'
import { RecurrencePreview } from '@web/features/planning/components/recurrence-preview'
import { RecurrenceScheduleFields } from '@web/features/planning/components/recurrence-schedule'
import { planningMessages } from '@web/features/planning/planning.messages'
import type {
  RecurrenceFieldsProps,
  RecurrenceFormInput,
} from '@web/features/planning/planning.types'
import { Controller, useFormContext } from 'react-hook-form'

const messages = planningMessages.form
const TYPE_ORDER: readonly RecurringEntryType[] = ['expense', 'card_purchase', 'income', 'transfer']
const TYPE_OPTIONS = TYPE_ORDER.map((entryType) => ({
  value: entryType,
  label: messages.types[entryType],
}))

export function RecurrenceFields({
  workspaceId,
  today,
  accounts,
  descriptionInput,
}: RecurrenceFieldsProps) {
  return (
    <>
      <p className="mx-4 mt-3.5 text-note text-ink-muted lg:mx-8">
        <span aria-hidden="true" className="font-semibold text-danger">
          {messages.requiredMark}
        </span>{' '}
        {messages.requiredLegend}
      </p>
      <div className="flex flex-col gap-4.5 px-4 pt-2.5 pb-6 lg:px-8">
        <TypeField />
        <FormField<RecurrenceFormInput>
          name="description"
          label={messages.description}
          isRequired
          maxLength={RECURRENCE_DESCRIPTION_MAX_LENGTH}
        >
          {(control) => (
            <TextInput
              autoComplete="off"
              placeholder={messages.descriptionPlaceholder}
              {...control}
              ref={(element) => {
                descriptionInput.current = element
                control.ref(element)
              }}
            />
          )}
        </FormField>
        <FormField<RecurrenceFormInput> name="amount" label={messages.amount} isRequired>
          {(control) => <MoneyInput size="lg" {...control} />}
        </FormField>
        <Controller<RecurrenceFormInput, 'amountIsEstimate'>
          name="amountIsEstimate"
          render={({ field }) => (
            <Switch
              label={messages.estimate}
              help={messages.estimateHelp}
              isChecked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
        <RecurrenceAccountFields workspaceId={workspaceId} accounts={accounts} />
        <RecurrenceScheduleFields today={today} />
        <RecurrencePreview workspaceId={workspaceId} today={today} />
      </div>
    </>
  )
}

function TypeField() {
  const { getValues, setValue, clearErrors } = useFormContext<RecurrenceFormInput>()

  function changeType(next: RecurringEntryType) {
    const previous = getValues('entryType')
    setValue('entryType', next, { shouldDirty: true })
    if (!keepsSourceAccount(previous, next)) {
      setValue('sourceAccountId', '')
      clearErrors('sourceAccountId')
    }
    if (!keepsCategoryAccount(previous, next)) {
      setValue('categoryAccountId', '')
      clearErrors('categoryAccountId')
    }
  }

  return (
    <FieldGroup label={messages.type} isRequired>
      <Controller<RecurrenceFormInput, 'entryType'>
        name="entryType"
        render={({ field }) => (
          <ChoiceChips
            label={messages.type}
            variant="pillOutline"
            options={TYPE_OPTIONS}
            value={field.value}
            onSelect={(next) => {
              const chosen = RECURRING_ENTRY_TYPES.find((entryType) => entryType === next)
              if (chosen) {
                changeType(chosen)
              }
            }}
            onBlur={field.onBlur}
          />
        )}
      />
    </FieldGroup>
  )
}
