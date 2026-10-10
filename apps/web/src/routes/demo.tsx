import { DEMO_WORKSPACE_IDS } from '@financas/shared'
import { createFileRoute } from '@tanstack/react-router'
import {
  DemoAccountActions,
  DemoAccountMenu,
  DemoGuard,
  DemoNotice,
  demoHomeProps,
  demoSearchSchema,
} from '@web/features/demo'
import { HomePage } from '@web/features/home'
import { openWorkspace, WorkspaceShell } from '@web/features/workspaces'

export const Route = createFileRoute('/demo')({
  validateSearch: demoSearchSchema,
  beforeLoad: ({ context, search }) =>
    openWorkspace(context.queryClient, DEMO_WORKSPACE_IDS[search.variant ?? 'normal']),
  component: function DemoRoute() {
    const { period, variant = 'normal' } = Route.useSearch()
    return (
      <DemoGuard>
        <WorkspaceShell
          workspaceId={DEMO_WORKSPACE_IDS[variant]}
          accountMenu={<DemoAccountMenu />}
          accountActions={<DemoAccountActions />}
          notice={<DemoNotice variant={variant} />}
        >
          <HomePage {...demoHomeProps(variant, period)} />
        </WorkspaceShell>
      </DemoGuard>
    )
  },
})
