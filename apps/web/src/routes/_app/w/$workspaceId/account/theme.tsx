import { createFileRoute } from '@tanstack/react-router'
import { AccountThemePage } from '@web/features/auth'

export const Route = createFileRoute('/_app/w/$workspaceId/account/theme')({
  component: function AccountThemeRoute() {
    const { workspaceId } = Route.useParams()
    return <AccountThemePage workspaceId={workspaceId} />
  },
})
