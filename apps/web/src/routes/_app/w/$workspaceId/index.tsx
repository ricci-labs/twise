import { createFileRoute } from '@tanstack/react-router'
import { LogOutButton } from '@web/features/auth'
import { StatusPage } from '@web/features/system-status'

export const Route = createFileRoute('/_app/w/$workspaceId/')({
  component: function WorkspaceHomeRoute() {
    return <StatusPage action={<LogOutButton />} />
  },
})
