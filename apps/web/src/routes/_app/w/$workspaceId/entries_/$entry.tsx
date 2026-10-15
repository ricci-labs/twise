import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  type EntriesListSearch,
  EntryDetailScreen,
  entryDetailSearchSchema,
} from '@web/features/entries'

export const Route = createFileRoute('/_app/w/$workspaceId/entries_/$entry')({
  validateSearch: entryDetailSearchSchema,
  component: function EntryDetailRoute() {
    const { workspaceId, entry } = Route.useParams()
    const { edit, ...listSearch } = Route.useSearch()
    const { account, access } = Route.useRouteContext()
    const navigate = useNavigate()
    const toList = (change: Partial<EntriesListSearch> = {}) =>
      void navigate({
        to: '/w/$workspaceId/entries',
        params: { workspaceId },
        search: { ...listSearch, ...change },
      })
    return (
      <EntryDetailScreen
        key={entry}
        workspaceId={workspaceId}
        entryId={entry}
        permissions={access.permissions}
        currentUserId={account.userId}
        currentUserName={account.displayName}
        memberDirectory={access.memberDirectory}
        isEditing={edit === true}
        listSearch={listSearch}
        onListSearchChange={toList}
        onClose={() => toList()}
        onEditClose={() =>
          void navigate({ to: '.', search: (previous) => ({ ...previous, edit: undefined }) })
        }
        onEdited={(entryId) =>
          void navigate({
            to: '/w/$workspaceId/entries/$entry',
            params: { workspaceId, entry: entryId },
            search: (previous) => ({ ...previous, edit: undefined }),
            replace: true,
          })
        }
      />
    )
  },
})
