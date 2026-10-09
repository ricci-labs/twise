import { createFileRoute } from '@tanstack/react-router'
import { LogOutButton } from '@web/features/auth'
import { CreateWorkspacePage } from '@web/features/workspaces'

export const Route = createFileRoute('/_app/workspaces/new')({
  component: function NewWorkspaceRoute() {
    const { account } = Route.useRouteContext()
    return <CreateWorkspacePage email={account.email} logOut={<LogOutButton variant="link" />} />
  },
})
