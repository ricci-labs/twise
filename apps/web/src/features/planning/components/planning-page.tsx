import { Link, useNavigate } from '@tanstack/react-router'
import { Button } from '@web/components/actions/button'
import { SegmentedControl } from '@web/components/actions/segmented-control'
import { TwiseIcon } from '@web/components/icons/twise-icon'
import { PageFrame } from '@web/components/layout/page-frame'
import { PageHeader } from '@web/components/layout/page-header'
import { BudgetsTab } from '@web/features/planning/components/budgets-tab'
import { GoalsTab } from '@web/features/planning/components/goals-tab'
import { OccurrencesTab } from '@web/features/planning/components/occurrences-tab'
import { RecurrenceEditor } from '@web/features/planning/components/recurrence-editor'
import { RecurrencesTab } from '@web/features/planning/components/recurrences-tab'
import { planningMessages as messages } from '@web/features/planning/planning.messages'
import {
  NEW_RECURRENCE,
  PLANNING_TABS,
  planningTabSchema,
} from '@web/features/planning/planning.schemas'
import type {
  PlanningHeaderActionProps,
  PlanningPageProps,
} from '@web/features/planning/planning.types'
import { useMediaQuery } from '@web/hooks/use-media-query'
import { DESKTOP_QUERY } from '@web/lib/breakpoints'
import { hasPermission } from '@web/lib/permissions'

const TAB_OPTIONS = PLANNING_TABS.map((tab) => ({ value: tab, label: messages.tabs[tab] }))
const TABS_WITH_NEW_RECURRENCE = new Set(['occurrences', 'recurrences'])

export function PlanningPage({ tab, ...props }: PlanningPageProps) {
  const navigate = useNavigate()
  return (
    <PageFrame className="gap-3 lg:gap-4">
      <PageHeader
        title={messages.title}
        description={messages.description}
        actions={<HeaderAction tab={tab} permissions={props.permissions} />}
      />
      <SegmentedControl
        label={messages.tabsLabel}
        width="full"
        selection="outline"
        options={TAB_OPTIONS}
        value={tab}
        onValueChange={(next) =>
          void navigate({
            to: '/w/$workspaceId/planning/$tab',
            params: { workspaceId: props.workspaceId, tab: planningTabSchema.parse(next) },
            search: (previous) => previous,
          })
        }
        className="shrink-0 lg:max-w-120"
      />
      <TabBody tab={tab} {...props} />
      <RecurrenceEditor
        workspaceId={props.workspaceId}
        permissions={props.permissions}
        search={props.search}
        onClose={() =>
          void navigate({
            to: '.',
            search: (previous) => ({
              ...previous,
              recurrence: undefined,
              recurrenceType: undefined,
            }),
          })
        }
      />
    </PageFrame>
  )
}

function HeaderAction({ tab, permissions }: PlanningHeaderActionProps) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  const canCreate = hasPermission(permissions, 'planning', 'create')
  if (!isDesktop || !canCreate || !TABS_WITH_NEW_RECURRENCE.has(tab)) {
    return null
  }
  return (
    <Button
      render={<Link to="." search={(previous) => ({ ...previous, recurrence: NEW_RECURRENCE })} />}
    >
      <TwiseIcon name="plus" size="sm" />
      {messages.newRecurrence}
    </Button>
  )
}

function TabBody({ tab, ...props }: PlanningPageProps) {
  if (tab === 'occurrences') {
    return <OccurrencesTab {...props} />
  }
  if (tab === 'recurrences') {
    return <RecurrencesTab {...props} />
  }
  if (tab === 'budgets') {
    return <BudgetsTab {...props} />
  }
  return <GoalsTab workspaceId={props.workspaceId} permissions={props.permissions} />
}
