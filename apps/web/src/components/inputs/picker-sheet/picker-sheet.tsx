import { Popover } from '@base-ui/react/popover'
import { Button } from '@web/components/actions/button'
import { Avatar } from '@web/components/display/avatar'
import { Badge } from '@web/components/display/badge'
import { CategoryArt } from '@web/components/display/category-art'
import { TwiseIcon } from '@web/components/icons/twise-icon'
import { ChoiceChips } from '@web/components/inputs/choice-chips'
import { pickerSheetMessages as messages } from '@web/components/inputs/picker-sheet/picker-sheet.messages'
import type {
  PickerChildrenProps,
  PickerChoiceProps,
  PickerContentProps,
  PickerEmptyStateProps,
  PickerItem,
  PickerItemEndProps,
  PickerRowArtProps,
  PickerSheetProps,
} from '@web/components/inputs/picker-sheet/picker-sheet.types'
import {
  pickerChildrenTitleVariants,
  pickerChildrenVariants,
  pickerEmptyActionVariants,
  pickerEmptyVariants,
  pickerListVariants,
  pickerOptionVariants,
  pickerPlaceholderArtVariants,
  pickerPopupVariants,
  pickerPositionerVariants,
  pickerRowDetailVariants,
  pickerRowEndVariants,
  pickerRowTextVariants,
  pickerRowVariants,
  pickerSearchInputVariants,
  pickerSearchVariants,
  pickerSubtitleVariants,
  pickerTileDetailVariants,
  pickerTileVariants,
} from '@web/components/inputs/picker-sheet/picker-sheet.variants'
import { TextInput } from '@web/components/inputs/text-input'
import { Sheet } from '@web/components/layout/sheet'
import { useMediaQuery } from '@web/hooks/use-media-query'
import { DESKTOP_QUERY } from '@web/lib/breakpoints'
import { Check, ChevronRight, Plus, Search } from 'lucide-react'
import { useState } from 'react'

const DIACRITICS = /\p{Diacritic}/gu

export function PickerSheet({
  title,
  isOpen,
  onOpenChange,
  anchor,
  popupWidth,
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
          <Popover.Positioner
            anchor={anchor}
            side="bottom"
            align="start"
            sideOffset={6}
            className={pickerPositionerVariants()}
          >
            <Popover.Popup
              data-slot="picker-sheet"
              className={pickerPopupVariants({ width: popupWidth })}
            >
              <Popover.Title className="sr-only">{title}</Popover.Title>
              <PickerContent {...content} onSelect={choose} />
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
    )
  }

  return (
    <Sheet title={title} closeLabel={messages.close} isOpen={isOpen} onOpenChange={onOpenChange}>
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
  const [openParent, setOpenParent] = useState(() => parentOf(items, value)?.value ?? null)
  if (items.length === 0 && empty) {
    return <PickerEmptyState empty={empty} />
  }
  const isSearching = search.trim() !== ''
  const shown = isSearching ? searchResults(items, search) : items
  const expanded = isSearching ? undefined : items.find((item) => item.value === openParent)
  const markedValue = openParent ?? value
  const press = (item: PickerItem) => {
    if (!isSearching && item.children?.length) {
      setOpenParent(item.value)
      return
    }
    onSelect(item.value)
  }

  return (
    <>
      {searchLabel && (
        <div className={pickerSearchVariants()}>
          <TextInput
            type="search"
            aria-label={searchLabel}
            placeholder={searchLabel}
            startAdornment={<Search aria-hidden="true" />}
            className={pickerSearchInputVariants()}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      )}
      {subtitle && <p className={pickerSubtitleVariants()}>{subtitle}</p>}
      {shown.length === 0 && <p className={pickerSubtitleVariants()}>{messages.nothingFound}</p>}
      <ul className={pickerListVariants({ layout })}>
        {shown.map((item) => (
          <li key={item.value}>
            <PickerChoice
              item={item}
              layout={layout}
              isCurrent={item.value === (isSearching ? value : markedValue)}
              onPress={press}
            />
          </li>
        ))}
      </ul>
      {expanded?.children?.length ? (
        <PickerChildren parent={expanded} value={value} onSelect={onSelect} />
      ) : null}
    </>
  )
}

function PickerChoice({ item, layout, isCurrent, onPress }: PickerChoiceProps) {
  const current = isCurrent ? true : undefined
  const detail = item.children?.length
    ? messages.subcategoryCount(item.children.length)
    : item.detail
  if (layout === 'options') {
    return (
      <button
        type="button"
        aria-current={current}
        onClick={() => onPress(item)}
        className={pickerOptionVariants()}
      >
        <span className="flex-1">{item.label}</span>
        {isCurrent && <Check data-slot="picker-check" aria-hidden="true" />}
      </button>
    )
  }
  if (layout === 'grid') {
    return (
      <button
        type="button"
        aria-current={current}
        onClick={() => onPress(item)}
        className={pickerTileVariants()}
      >
        <CategoryArt name={item.label} icon={item.icon} variant="onLight" size="xl" />
        {item.label}
        {detail && <span className={pickerTileDetailVariants()}>{detail}</span>}
      </button>
    )
  }
  return (
    <button
      type="button"
      aria-current={current}
      onClick={() => onPress(item)}
      className={pickerRowVariants()}
    >
      <PickerRowArt item={item} />
      <span className={pickerRowTextVariants()}>
        {item.label}
        {detail && (
          <span className={pickerRowDetailVariants({ isStrong: item.isDetailStrong })}>
            {detail}
          </span>
        )}
      </span>
      {item.end && <PickerEnd end={item.end} />}
      {item.hasChevron && <ChevronRight data-slot="picker-chevron" aria-hidden="true" />}
      {isCurrent && !item.hasChevron && <Check data-slot="picker-check" aria-hidden="true" />}
    </button>
  )
}

function PickerEnd({ end }: PickerItemEndProps) {
  if (end.tone) {
    return (
      <Badge tone={end.tone} size="status" hasDot>
        {end.label}
      </Badge>
    )
  }
  return <span className={pickerRowEndVariants()}>{end.label}</span>
}

function PickerRowArt({ item }: PickerRowArtProps) {
  if (item.isPerson) {
    return <Avatar name={item.label} tone="paper" size="lg" />
  }
  if (item.placeholderIcon) {
    return (
      <span data-slot="category-art" aria-hidden="true" className={pickerPlaceholderArtVariants()}>
        <TwiseIcon name={item.placeholderIcon} />
      </span>
    )
  }
  return <CategoryArt name={item.label} icon={item.icon} size="lg" />
}

function PickerChildren({ parent, value, onSelect }: PickerChildrenProps) {
  const options = [
    { value: parent.value, label: messages.onlyParent(parent.label) },
    ...(parent.children ?? []).map((child) => ({ value: child.value, label: child.label })),
  ]
  return (
    <div className={pickerChildrenVariants()}>
      <p className={pickerChildrenTitleVariants()}>{messages.within(parent.label)}</p>
      <ChoiceChips
        label={messages.within(parent.label)}
        variant="outline"
        options={options}
        value={value ?? ''}
        onSelect={onSelect}
      />
    </div>
  )
}

function PickerEmptyState({ empty }: PickerEmptyStateProps) {
  return (
    <div className={pickerEmptyVariants()}>
      <CategoryArt name={empty.title} icon={empty.icon} size="2xl" />
      <b>{empty.title}</b>
      <span>{empty.text}</span>
      {empty.actionLabel && (
        <Button className={pickerEmptyActionVariants()} onClick={empty.onAction}>
          <Plus aria-hidden="true" />
          {empty.actionLabel}
        </Button>
      )}
    </div>
  )
}

function searchResults(items: readonly PickerItem[], search: string): PickerItem[] {
  const wanted = folded(search.trim())
  return items.flatMap((item) => [
    ...(folded(item.label).includes(wanted) ? [{ ...item, children: undefined }] : []),
    ...(item.children ?? [])
      .filter((child) => folded(child.label).includes(wanted))
      .map((child) => ({
        ...child,
        icon: child.icon ?? item.icon,
        detail: messages.childOf(item.label),
      })),
  ])
}

function parentOf(items: readonly PickerItem[], value: string | null): PickerItem | undefined {
  return items.find((item) => item.children?.some((child) => child.value === value))
}

function folded(text: string): string {
  return text.normalize('NFD').replace(DIACRITICS, '').toLocaleLowerCase('pt-BR')
}
