import { CategoryArt } from '@web/components/display/category-art'
import { FormField } from '@web/components/forms/form-field'
import { PickerField } from '@web/components/inputs/picker-field'
import { PickerSheet } from '@web/components/inputs/picker-sheet'
import { accountsMessages } from '@web/features/accounts/accounts.messages'
import type { CategoryFormInput, ParentFieldProps } from '@web/features/accounts/accounts.types'
import { useRef, useState } from 'react'

const messages = accountsMessages.categoryForm
const MAIN = ''

export function ParentField({ kind, mains, help }: ParentFieldProps) {
  const [isOpen, setIsOpen] = useState(false)
  const anchor = useRef<HTMLButtonElement>(null)
  const items = [
    { value: MAIN, label: messages.none, placeholderIcon: 'subcategory' as const },
    ...mains.map((main) => ({
      value: main.id,
      label: main.name,
      icon: main.icon,
      detail: messages.parentDetail[kind],
    })),
  ]
  return (
    <FormField<CategoryFormInput>
      name="parentId"
      label={messages.parent}
      help={help}
      helpGap="roomy"
    >
      {(control) => {
        const chosen = mains.find((main) => main.id === control.value)
        return (
          <>
            <PickerField
              id={control.id}
              ref={(element) => {
                anchor.current = element
                control.ref(element)
              }}
              aria-invalid={control['aria-invalid']}
              aria-describedby={control['aria-describedby']}
              value={chosen?.name ?? messages.none}
              detail={chosen ? messages.parentDetail[kind] : undefined}
              art={chosen && <CategoryArt name={chosen.name} icon={chosen.icon} />}
              placeholder={messages.none}
              onClick={() => setIsOpen(true)}
            />
            <PickerSheet
              title={messages.parent}
              subtitle={messages.parentSubtitle}
              items={items}
              value={control.value}
              anchor={anchor}
              isOpen={isOpen}
              onOpenChange={(open) => {
                setIsOpen(open)
                if (!open) {
                  control.onBlur()
                }
              }}
              onSelect={(value) => control.onChange({ target: { value } })}
            />
          </>
        )
      }}
    </FormField>
  )
}
