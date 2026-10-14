import { Popover } from '@base-ui/react/popover'
import { Button } from '@web/components/actions/button'
import { CategoryArt } from '@web/components/display/category-art'
import { pickerSheetMessages as messages } from '@web/components/inputs/picker-sheet/picker-sheet.messages'
import type {
  PickerChoiceProps,
  PickerContentProps,
  PickerEmptyStateProps,
  PickerItem,
  PickerSheetProps,
} from '@web/components/inputs/picker-sheet/picker-sheet.types'
import {
  pickerEmptyActionVariants,
  pickerEmptyVariants,
  pickerListVariants,
  pickerPopupVariants,
  pickerRowDetailVariants,
  pickerRowTextVariants,
  pickerRowVariants,
  pickerSubtitleVariants,
  pickerTileCheckVariants,
  pickerTileVariants,
} from '@web/components/inputs/picker-sheet/picker-sheet.variants'
import { TextInput } from '@web/components/inputs/text-input'
import { Sheet } from '@web/components/layout/sheet'
import { useMediaQuery } from '@web/hooks/use-media-query'
import { DESKTOP_QUERY } from '@web/lib/breakpoints'
import { Check } from 'lucide-react'
import { useState } from 'react'

const DIACRITICS = /\p{Diacritic}/gu

export function PickerSheet({
  title,
  isOpen,
  onOpenChange,
  anchor,
  onSelect,
  ...content
}: PickerSheetProps) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  const choose = (value: string) => {
    onSelect(value)
    onOpenChange(false)
  }

  if (isDesktop && anchor) {
    return (
      <Popover.Root open={isOpen} onOpenChange={onOpenChange}>
        <Popover.Portal>
          <Popover.Positioner anchor={anchor} side="bottom" align="start" sideOffset={6}>
            <Popover.Popup data-slot="picker-sheet" className={pickerPopupVariants()}>
              <Popover.Title className="sr-only">{title}</Popover.Title>
              <PickerContent {...content} onSelect={choose} />
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
    )
  }

  return (
    <Sheet title={title} isOpen={isOpen} onOpenChange={onOpenChange}>
      <PickerContent {...content} onSelect={choose} />
    </Sheet>
  )
}

function PickerContent({
  subtitle,
  items,
  value,
  onSelect,
  layout = 'list',
  searchLabel,
  empty,
}: PickerContentProps) {
  const [search, setSearch] = useState('')
  if (items.length === 0 && empty) {
    return <PickerEmptyState empty={empty} />
  }
  const shown = items.filter((item) => matches(item, search))
  return (
    <>
      {searchLabel && (
        <TextInput
          type="search"
          aria-label={searchLabel}
          placeholder={searchLabel}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      )}
      {subtitle && <p className={pickerSubtitleVariants()}>{subtitle}</p>}
      {shown.length === 0 && <p className={pickerSubtitleVariants()}>{messages.nothingFound}</p>}
      <ul className={pickerListVariants({ layout })}>
        {shown.map((item) => (
          <li key={item.value}>
            <PickerChoice
              item={item}
              layout={layout}
              isCurrent={item.value === value}
              onSelect={onSelect}
            />
          </li>
        ))}
      </ul>
    </>
  )
}

function PickerChoice({ item, layout, isCurrent, onSelect }: PickerChoiceProps) {
  const current = isCurrent ? true : undefined
  if (layout === 'grid') {
    return (
      <button
        type="button"
        aria-current={current}
        onClick={() => onSelect(item.value)}
        className={pickerTileVariants()}
      >
        <CategoryArt name={item.label} icon={item.icon} variant="onLight" size="xl" />
        {item.label}
        {isCurrent && (
          <span aria-hidden="true" className={pickerTileCheckVariants()}>
            <Check />
          </span>
        )}
      </button>
    )
  }
  return (
    <button
      type="button"
      aria-current={current}
      onClick={() => onSelect(item.value)}
      className={pickerRowVariants()}
    >
      <CategoryArt name={item.label} icon={item.icon} size="lg" />
      <span className={pickerRowTextVariants()}>
        {item.label}
        {item.detail && <span className={pickerRowDetailVariants()}>{item.detail}</span>}
      </span>
      {isCurrent && <Check data-slot="picker-check" aria-hidden="true" />}
    </button>
  )
}

function PickerEmptyState({ empty }: PickerEmptyStateProps) {
  return (
    <div className={pickerEmptyVariants()}>
      <CategoryArt name={empty.title} icon={empty.icon} size="2xl" />
      <b>{empty.title}</b>
      <span>{empty.text}</span>
      <Button className={pickerEmptyActionVariants()} onClick={empty.onAction}>
        {empty.actionLabel}
      </Button>
    </div>
  )
}

function matches(item: PickerItem, search: string): boolean {
  const wanted = folded(search.trim())
  return wanted === '' || folded(item.label).includes(wanted)
}

function folded(text: string): string {
  return text.normalize('NFD').replace(DIACRITICS, '').toLocaleLowerCase('pt-BR')
}
