import { Autocomplete } from '@base-ui/react/autocomplete'
import type {
  SuggestInputProps,
  SuggestionTextProps,
} from '@web/components/inputs/suggest-input/suggest-input.types'
import {
  suggestItemVariants,
  suggestPopupVariants,
  suggestPositionerVariants,
} from '@web/components/inputs/suggest-input/suggest-input.variants'
import { TextInput } from '@web/components/inputs/text-input'
import { useRef, useState } from 'react'

const PICKED = 'item-press'

export function SuggestInput({
  value,
  suggestions,
  onChange,
  onPick,
  ...props
}: SuggestInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const field = useRef<HTMLDivElement>(null)
  const hasSuggestions = suggestions.length > 0
  return (
    <Autocomplete.Root
      items={suggestions}
      value={value}
      filter={null}
      open={isOpen && hasSuggestions}
      onOpenChange={setIsOpen}
      autoHighlight="always"
      onValueChange={(next, details) => {
        onChange({ target: { value: next } })
        if (details.reason === PICKED) {
          onPick(next)
        }
      }}
    >
      <div ref={field}>
        <Autocomplete.Input render={<TextInput {...props} />} />
      </div>
      <Autocomplete.Portal>
        <Autocomplete.Positioner
          anchor={field}
          sideOffset={4}
          align="start"
          className={suggestPositionerVariants()}
        >
          <Autocomplete.Popup className={suggestPopupVariants()}>
            <Autocomplete.List>
              {(suggestion: string) => (
                <Autocomplete.Item
                  key={suggestion}
                  value={suggestion}
                  className={suggestItemVariants()}
                >
                  <SuggestionText text={suggestion} query={value} />
                </Autocomplete.Item>
              )}
            </Autocomplete.List>
          </Autocomplete.Popup>
        </Autocomplete.Positioner>
      </Autocomplete.Portal>
    </Autocomplete.Root>
  )
}

function SuggestionText({ text, query }: SuggestionTextProps) {
  const start = text.toLocaleLowerCase('pt-BR').indexOf(query.trim().toLocaleLowerCase('pt-BR'))
  if (query.trim() === '' || start < 0) {
    return text
  }
  const end = start + query.trim().length
  return (
    <>
      {text.slice(0, start)}
      <b>{text.slice(start, end)}</b>
      {text.slice(end)}
    </>
  )
}
