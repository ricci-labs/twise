import { createFileRoute, Outlet } from '@tanstack/react-router'
import { openWorkspace } from '@web/features/workspaces'

export const Route = createFileRoute('/_app/w/$workspaceId')({
  beforeLoad: ({ context, params }) => openWorkspace(context.queryClient, params.workspaceId),
  component: Outlet,
})
