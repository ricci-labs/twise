import { createFileRoute } from '@tanstack/react-router'
import { EntryDetailPage } from '@web/features/entries'

export const Route = createFileRoute('/_app/w/$workspaceId/entries_/$entry')({
  component: function EntryDetailRoute() {
    const { workspaceId, entry } = Route.useParams()
    const { account, access } = Route.useRouteContext()
    return (
      <EntryDetailPage
        key={entry}
        workspaceId={workspaceId}
        entryId={entry}
        permissions={access.permissions}
        currentUserId={account.userId}
        memberDirectory={access.memberDirectory}
      />
    )
  },
})
