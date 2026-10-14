import type { TextInputProps } from '@web/components/inputs/text-input'

export type SuggestInputChange = { target: { value: string } }

export type SuggestInputProps = Omit<TextInputProps, 'value' | 'onChange'> & {
  value: string
  suggestions: readonly string[]
  onChange: (change: SuggestInputChange) => void
  onPick: (suggestion: string) => void
}

export type SuggestionTextProps = {
  text: string
  query: string
}
