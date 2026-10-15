import { searchInputMessages as messages } from '@web/components/inputs/search-input/search-input.messages'
import type { SearchInputProps } from '@web/components/inputs/search-input/search-input.types'
import {
  searchClearVariants,
  searchInputVariants,
} from '@web/components/inputs/search-input/search-input.variants'
import { TextInput } from '@web/components/inputs/text-input'
import { cn } from '@web/lib/cn'
import { Search, X } from 'lucide-react'
import { useRef } from 'react'

export function SearchInput({
  label,
  value,
  onValueChange,
  clearLabel = messages.clear,
  placeholder = label,
  className,
  onKeyDown,
  ...props
}: SearchInputProps) {
  const input = useRef<HTMLInputElement>(null)
  const clear = () => {
    onValueChange('')
    input.current?.focus()
  }
  return (
    <TextInput
      ref={input}
      type="search"
      aria-label={label}
      placeholder={placeholder}
      className={cn(searchInputVariants(), className)}
      startAdornment={<Search aria-hidden="true" />}
      endAdornment={
        value === '' ? undefined : (
          <button
            type="button"
            aria-label={clearLabel}
            className={searchClearVariants()}
            onClick={clear}
          >
            <X aria-hidden="true" />
          </button>
        )
      }
      value={value}
      onChange={(event) => onValueChange(event.target.value)}
      onKeyDown={(event) => {
        onKeyDown?.(event)
        if (event.key === 'Escape' && value !== '') {
          event.stopPropagation()
          onValueChange('')
        }
      }}
      {...props}
    />
  )
}
