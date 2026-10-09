import { createFileRoute, redirect } from '@tanstack/react-router'
import { chooseWorkspace } from '@web/features/workspaces'

export const Route = createFileRoute('/_app/')({
  beforeLoad: async ({ context }) => {
    const choice = await chooseWorkspace(context.queryClient)
    if (choice.kind === 'open') {
      throw redirect({ to: '/w/$workspaceId', params: { workspaceId: choice.workspaceId } })
    }
    throw redirect({ to: choice.kind === 'create' ? '/workspaces/new' : '/workspaces' })
  },
})
