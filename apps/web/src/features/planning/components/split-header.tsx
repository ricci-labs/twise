import { Link } from '@tanstack/react-router'
import { PageHeader } from '@web/components/layout/page-header'
import { SubPageHeader } from '@web/components/layout/sub-page-header'
import { Breadcrumb } from '@web/components/navigation/breadcrumb'
import { planningMessages } from '@web/features/planning/planning.messages'
import type { SplitHeaderProps } from '@web/features/planning/planning.types'
import { useMediaQuery } from '@web/hooks/use-media-query'
import { DESKTOP_QUERY } from '@web/lib/breakpoints'

const messages = planningMessages.split

export function SplitHeader({ workspaceId, actions }: SplitHeaderProps) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  const goals = <Link to="/w/$workspaceId/planning/$tab" params={{ workspaceId, tab: 'goals' }} />
  if (!isDesktop) {
    return (
      <SubPageHeader
        title={messages.title}
        description={messages.intro}
        backLabel={messages.back}
        back={goals}
      />
    )
  }
  return (
    <div className="flex flex-col gap-2">
      <Breadcrumb
        label={messages.crumb}
        items={[{ label: messages.back, link: goals }, { label: messages.title }]}
      />
      <PageHeader title={messages.title} description={messages.introDesktop} actions={actions} />
    </div>
  )
}
