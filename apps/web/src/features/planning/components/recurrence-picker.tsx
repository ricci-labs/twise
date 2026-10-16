import { CategoryArt } from '@web/components/display/category-art'
import { PickerField } from '@web/components/inputs/picker-field'
import { PickerSheet } from '@web/components/inputs/picker-sheet'
import type { ChosenPickerItem, RecurrencePickerProps } from '@web/features/planning/planning.types'
import { useRef, useState } from 'react'

export function RecurrencePicker({
  control,
  title,
  subtitle,
  placeholder,
  items,
  layout,
  searchLabel,
  empty,
  action,
}: RecurrencePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const anchor = useRef<HTMLButtonElement>(null)
  const chosen = chosenOf(items, control.value)

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
        value={chosen?.label ?? null}
        parentLabel={chosen?.parent?.label}
        detail={chosen?.item.detail}
        badge={chosen?.item.badge}
        art={chosen && <CategoryArt name={chosen.label} icon={chosen.icon} />}
        placeholder={placeholder}
        onClick={() => setIsOpen(true)}
      />
      <PickerSheet
        title={title}
        subtitle={subtitle}
        items={items}
        value={control.value || null}
        layout={layout}
        searchLabel={searchLabel}
        anchor={anchor}
        isOpen={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open)
          if (!open) {
            control.onBlur()
          }
        }}
        onSelect={(value) => control.onChange({ target: { value } })}
        empty={empty}
        action={action}
      />
    </>
  )
}

function chosenOf(
  items: RecurrencePickerProps['items'],
  value: string,
): ChosenPickerItem | undefined {
  for (const item of items) {
    if (item.value === value) {
      return { item, label: item.label, icon: item.icon, parent: undefined }
    }
    const child = item.children?.find((candidate) => candidate.value === value)
    if (child) {
      return { item: child, label: child.label, icon: child.icon ?? item.icon, parent: item }
    }
  }
  return undefined
}
