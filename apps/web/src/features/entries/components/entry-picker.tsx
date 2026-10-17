import { Avatar } from '@web/components/display/avatar'
import { CategoryArt } from '@web/components/display/category-art'
import { PickerField } from '@web/components/inputs/picker-field'
import { PickerSheet } from '@web/components/inputs/picker-sheet'
import type { ChosenArtProps, EntryPickerProps } from '@web/features/entries/entries.types'
import { useRef, useState } from 'react'

export function EntryPicker({
  control,
  title,
  subtitle,
  placeholder,
  items,
  layout,
  searchLabel,
  empty,
  action,
}: EntryPickerProps) {
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
        detail={chosen?.item.fieldDetail ?? chosen?.item.detail}
        isDetailStrong={chosen?.item.isDetailStrong}
        badge={chosen?.item.badge}
        art={chosen && <ChosenArt item={chosen.item} label={chosen.label} icon={chosen.icon} />}
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
        action={action}
        empty={
          empty && {
            ...empty,
            onAction: () => {
              setIsOpen(false)
              empty.onAction?.()
            },
          }
        }
      />
    </>
  )
}

function ChosenArt({ item, label, icon }: ChosenArtProps) {
  if (item.isPerson) {
    return <Avatar name={label} tone="paper" size="lg" />
  }
  return <CategoryArt name={label} icon={icon} />
}

function chosenOf(items: EntryPickerProps['items'], value: string) {
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
