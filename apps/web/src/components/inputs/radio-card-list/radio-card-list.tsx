import { Radio } from '@base-ui/react/radio'
import { RadioGroup } from '@base-ui/react/radio-group'
import { ShowMoreButton } from '@web/components/actions/show-more-button'
import { Badge } from '@web/components/display/badge'
import { RichText } from '@web/components/display/rich-text'
import { radioCardListMessages as messages } from '@web/components/inputs/radio-card-list/radio-card-list.messages'
import type {
  RadioCard,
  RadioCardListProps,
} from '@web/components/inputs/radio-card-list/radio-card-list.types'
import {
  radioCardDetailVariants,
  radioCardListBoxVariants,
  radioCardListEmptyVariants,
  radioCardListVariants,
  radioCardTextVariants,
  radioCardVariants,
  radioDotVariants,
} from '@web/components/inputs/radio-card-list/radio-card-list.variants'
import { SearchInput } from '@web/components/inputs/search-input'
import { useLongList } from '@web/hooks/use-long-list'
import { cn } from '@web/lib/cn'
import { LIST_SEARCH_ABOVE, matchesSearch } from '@web/lib/long-lists'

export function RadioCardList({
  label,
  options,
  value,
  onSelect,
  onBlur,
  layout,
  searchLabel,
  className,
}: RadioCardListProps) {
  const list = useLongList({
    items: options,
    isPinned: (option) => option.value === value,
    searchAbove: searchLabel === undefined ? undefined : LIST_SEARCH_ABOVE,
    searchResults,
    canShorten: layout !== 'pair',
  })

  return (
    <div className={cn(radioCardListBoxVariants(), className)}>
      {list.hasSearch && searchLabel !== undefined && (
        <SearchInput label={searchLabel} value={list.search} onValueChange={list.setSearch} />
      )}
      {list.shown.length === 0 && (
        <p className={radioCardListEmptyVariants()}>{messages.nothingFound}</p>
      )}
      <RadioGroup
        data-slot="radio-card-list"
        aria-label={label}
        value={value}
        onValueChange={(next) => onSelect(String(next))}
        className={radioCardListVariants({ layout })}
      >
        {list.shown.map((option, position) => (
          <Radio.Root
            key={option.value}
            ref={list.refAt(position)}
            value={option.value}
            disabled={option.isDisabled}
            nativeButton
            render={<button type="button" onBlur={onBlur} />}
            className={radioCardVariants({ layout })}
          >
            <span data-slot="radio-dot" aria-hidden="true" className={radioDotVariants()} />
            <span className={radioCardTextVariants()}>
              {option.label}
              {option.detail && (
                <span className={radioCardDetailVariants()}>
                  <RichText text={option.detail} />
                </span>
              )}
            </span>
            {option.badge && (
              <Badge tone={option.badge.tone} hasDot>
                {option.badge.label}
              </Badge>
            )}
          </Radio.Root>
        ))}
      </RadioGroup>
      {list.hiddenCount > 0 && (
        <ShowMoreButton hiddenCount={list.hiddenCount} onClick={list.showAll} />
      )}
    </div>
  )
}

function searchResults(options: readonly RadioCard[], search: string): RadioCard[] {
  return options.filter((option) => matchesSearch(`${option.label} ${option.detail ?? ''}`, search))
}
