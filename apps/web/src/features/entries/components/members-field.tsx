import { useQuery } from '@tanstack/react-query'
import { FieldGroup } from '@web/components/forms/field-group'
import { ChoiceChips } from '@web/components/inputs/choice-chips'
import { membersQueryOptions } from '@web/features/entries/api/entries.queries'
import { entriesMessages } from '@web/features/entries/entries.messages'
import type { ExpenseFormInput, MembersFieldProps } from '@web/features/entries/entries.types'
import { useController } from 'react-hook-form'

const ALONE = 1

export function MembersField({ workspaceId }: MembersFieldProps) {
  const members = useQuery(membersQueryOptions(workspaceId)).data ?? []
  const { field } = useController<ExpenseFormInput, 'spentByUserId'>({ name: 'spentByUserId' })
  if (members.length <= ALONE) {
    return null
  }
  return (
    <FieldGroup label={entriesMessages.fields.spentBy}>
      <ChoiceChips
        label={entriesMessages.fields.spentBy}
        variant="card"
        value={field.value}
        onSelect={field.onChange}
        onBlur={field.onBlur}
        options={members.map((member) => ({
          value: member.userId,
          label: member.displayName,
          avatarName: member.displayName,
        }))}
      />
    </FieldGroup>
  )
}
