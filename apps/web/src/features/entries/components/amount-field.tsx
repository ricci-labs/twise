import { FormField } from '@web/components/forms/form-field'
import { MoneyInput } from '@web/components/inputs/money-input'
import { Switch } from '@web/components/inputs/switch'
import { entriesMessages } from '@web/features/entries/entries.messages'
import type { AmountFieldProps, EntryFormInput } from '@web/features/entries/entries.types'
import { Controller, useFormContext, useWatch } from 'react-hook-form'

const fields = entriesMessages.fields

export function AmountField({ isOpeningBalance, warning, inputRef }: AmountFieldProps) {
  const { control } = useFormContext<EntryFormInput>()
  const isNegative = useWatch<EntryFormInput, 'isNegative'>({ name: 'isNegative' })

  return (
    <div className="flex flex-col gap-2">
      <FormField<EntryFormInput>
        name="amount"
        label={isOpeningBalance ? fields.balance : fields.amount}
        warning={warning}
        isRequired
      >
        {(field) => (
          <MoneyInput
            size="lg"
            isNegative={isOpeningBalance && isNegative}
            {...field}
            onBlur={() => {
              if (field.value !== '') {
                field.onBlur()
              }
            }}
            ref={(element) => {
              inputRef.current = element
              field.ref(element)
            }}
          />
        )}
      </FormField>
      {isOpeningBalance && (
        <Controller
          control={control}
          name="isNegative"
          render={({ field }) => (
            <Switch
              label={fields.isNegative}
              isChecked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
      )}
    </div>
  )
}
