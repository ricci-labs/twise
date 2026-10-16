import { useQuery } from '@tanstack/react-query'
import { ListSkeleton } from '@web/components/feedback/list-skeleton'
import { SectionError } from '@web/components/feedback/section-error'
import { PageFrame } from '@web/components/layout/page-frame'
import {
  accountsQueryOptions,
  allocationStepsQueryOptions,
  goalsQueryOptions,
  overviewQueryOptions,
} from '@web/features/planning/api/planning.queries'
import { SplitEditor } from '@web/features/planning/components/split-editor'
import { SplitHeader } from '@web/features/planning/components/split-header'
import { planningMessages } from '@web/features/planning/planning.messages'
import type { SplitPageProps } from '@web/features/planning/planning.types'
import { usePageTitle } from '@web/hooks/use-page-title'
import { ApiError } from '@web/lib/api/api-error'
import { hasPermission } from '@web/lib/permissions'

const messages = planningMessages.split
const SKELETON_ROWS = 4

export function SplitPage({ workspaceId, permissions }: SplitPageProps) {
  usePageTitle(messages.pageTitle)
  return (
    <PageFrame className="gap-3 lg:gap-4">
      <SplitBody workspaceId={workspaceId} permissions={permissions} />
    </PageFrame>
  )
}

function SplitBody({ workspaceId, permissions }: SplitPageProps) {
  const steps = useQuery(allocationStepsQueryOptions(workspaceId))
  const goals = useQuery(goalsQueryOptions(workspaceId))
  const accounts = useQuery(accountsQueryOptions(workspaceId))
  const overview = useQuery(overviewQueryOptions(workspaceId, undefined))
  const failed = [steps, goals, accounts].find((query) => query.isError)
  if (failed) {
    return (
      <>
        <SplitHeader workspaceId={workspaceId} />
        <SectionError
          message={messages.failed}
          errorRef={failed.error instanceof ApiError ? failed.error.ref : null}
          isRetrying={failed.isFetching}
          onRetry={() => void failed.refetch()}
        />
      </>
    )
  }
  if (!steps.data || !goals.data || !accounts.data) {
    return (
      <>
        <SplitHeader workspaceId={workspaceId} />
        <ListSkeleton rows={SKELETON_ROWS} />
      </>
    )
  }
  return (
    <SplitEditor
      key={JSON.stringify(steps.data)}
      workspaceId={workspaceId}
      initial={steps.data}
      goals={goals.data}
      accounts={accounts.data}
      overview={overview.data}
      canEdit={hasPermission(permissions, 'planning', 'update')}
    />
  )
}
