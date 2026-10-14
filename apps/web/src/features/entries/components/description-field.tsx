import { useQuery } from '@tanstack/react-query'
import { AutoFillTip } from '@web/components/feedback/auto-fill-tip'
import { FormField } from '@web/components/forms/form-field'
import { SuggestInput } from '@web/components/inputs/suggest-input'
import { TextInput } from '@web/components/inputs/text-input'
import { entrySuggestionsQueryOptions } from '@web/features/entries/api/entries.queries'
import { categoryTypeOf } from '@web/features/entries/components/entry-kind'
import { entriesMessages } from '@web/features/entries/entries.messages'
import type { DescriptionFieldProps, EntryFormInput } from '@web/features/entries/entries.types'
import { useDebouncedValue } from '@web/hooks/use-debounced-value'
import { useWatch } from 'react-hook-form'

const fields = entriesMessages.fields
const TYPING_PAUSE_MS = 250

export function DescriptionField({ workspaceId, entryType, autoFill }: DescriptionFieldProps) {
  const description = useWatch<EntryFormInput, 'description'>({ name: 'description' })
  const search = useDebouncedValue(description, TYPING_PAUSE_MS)
  const type = categoryTypeOf(entryType)
  const suggestions =
    useQuery({
      ...entrySuggestionsQueryOptions(workspaceId, type ?? 'expense', search),
      enabled: type !== undefined && search.trim() !== '',
    }).data ?? []
  const offered = suggestions
    .map((suggestion) => suggestion.description)
    .filter((text) => text !== description)

  return (
    <div className="flex flex-col gap-2">
      <FormField<EntryFormInput> name="description" label={fields.description} isRequired>
        {(control) =>
          type ? (
            <SuggestInput
              autoComplete="off"
              placeholder={fields.descriptionPlaceholder}
              {...control}
              suggestions={description.trim() === '' ? [] : offered}
              onPick={(picked) => {
                const suggestion = suggestions.find((item) => item.description === picked)
                if (suggestion) {
                  autoFill.fillFromSuggestion(suggestion)
                }
              }}
            />
          ) : (
            <TextInput
              autoComplete="off"
              placeholder={fields.descriptionPlaceholder}
              {...control}
            />
          )
        }
      </FormField>
      {autoFill.autoFill?.place === 'description' && (
        <AutoFillTip text={autoFill.autoFill.text} onUndo={autoFill.undo} />
      )}
    </div>
  )
}
