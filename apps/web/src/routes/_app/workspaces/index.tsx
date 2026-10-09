import { createFileRoute } from '@tanstack/react-router'
import {
  WorkspacePickerPage,
  workspacePickerSearchSchema,
  workspacesQueryOptions,
} from '@web/features/workspaces'

export const Route = createFileRoute('/_app/workspaces/')({
  validateSearch: workspacePickerSearchSchema,
  loader: ({ context }) => context.queryClient.ensureQueryData(workspacesQueryOptions()),
  component: function WorkspacesRoute() {
    const { lost } = Route.useSearch()
    return <WorkspacePickerPage isLost={lost} />
  },
})
