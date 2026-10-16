import { useNavigate } from '@tanstack/react-router'
import { SegmentedControl } from '@web/components/actions/segmented-control'
import { EmptyBlock } from '@web/components/feedback/empty-block'
import { PageFrame } from '@web/components/layout/page-frame'
import { PageHeader } from '@web/components/layout/page-header'
import { BudgetsTab } from '@web/features/planning/components/budgets-tab'
import { OccurrencesTab } from '@web/features/planning/components/occurrences-tab'
import { RecurrenceEditor } from '@web/features/planning/components/recurrence-editor'
import { RecurrencesTab } from '@web/features/planning/components/recurrences-tab'
import { planningMessages as messages } from '@web/features/planning/planning.messages'
import { PLANNING_TABS, planningTabSchema } from '@web/features/planning/planning.schemas'
import type { PlanningPageProps } from '@web/features/planning/planning.types'

const TAB_OPTIONS = PLANNING_TABS.map((tab) => ({ value: tab, label: messages.tabs[tab] }))

export function PlanningPage({ tab, ...props }: PlanningPageProps) {
  const navigate = useNavigate()
  return (
    <PageFrame className="gap-3 lg:gap-4">
      <PageHeader title={messages.title} description={messages.description} />
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
  return <EmptyBlock icon="calendar" title={messages.soon.title} text={messages.soon.text} />
}
