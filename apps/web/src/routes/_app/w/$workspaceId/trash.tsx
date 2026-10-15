import { createFileRoute } from '@tanstack/react-router'
import { EntriesTrashPage } from '@web/features/entries'

export const Route = createFileRoute('/_app/w/$workspaceId/trash')({
  component: function TrashRoute() {
    const { workspaceId } = Route.useParams()
    const { account, access } = Route.useRouteContext()
    return (
      <EntriesTrashPage
        workspaceId={workspaceId}
        permissions={access.permissions}
        currentUserId={account.userId}
        memberDirectory={access.memberDirectory}
      />
    )
  },
})
