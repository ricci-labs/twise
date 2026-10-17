import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { SectionError } from '@web/components/feedback/section-error'
import { SectionSkeleton } from '@web/components/feedback/section-skeleton'
import { PageFrame } from '@web/components/layout/page-frame'
import { PageHeader } from '@web/components/layout/page-header'
import { SubPageHeader } from '@web/components/layout/sub-page-header'
import { Breadcrumb } from '@web/components/navigation/breadcrumb'
import {
  chargeTextQueryOptions,
  todayQueryOptions,
  workspaceSettingsQueryOptions,
} from '@web/features/settings/api/settings.queries'
import { ChargeTextForm } from '@web/features/settings/components/charge-text-form'
import { settingsMessages } from '@web/features/settings/settings.messages'
import type {
  ChargeTextContentProps,
  ChargeTextPageProps,
} from '@web/features/settings/settings.types'
import { useMediaQuery } from '@web/hooks/use-media-query'
import { usePageTitle } from '@web/hooks/use-page-title'
import { ApiError } from '@web/lib/api/api-error'
import { DESKTOP_QUERY } from '@web/lib/breakpoints'
import { hasPermission } from '@web/lib/permissions'

const messages = settingsMessages.chargeText
const SKELETON_LINES = 8

export function ChargeTextPage({ workspaceId, permissions, ...people }: ChargeTextPageProps) {
  usePageTitle(messages.pageTitle)
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  const settingsLink = <Link to="/w/$workspaceId/settings" params={{ workspaceId }} />
  const canUpdate = hasPermission(permissions, 'settings', 'update')
  const content = (
    <ChargeTextContent
      {...people}
      workspaceId={workspaceId}
      canUpdate={canUpdate}
      isDesktop={isDesktop}
    />
  )
  if (isDesktop) {
    return (
      <PageFrame>
        <div className="mb-2">
          <Breadcrumb
            label={messages.crumb}
            items={[
              { label: settingsMessages.title, link: settingsLink },
              { label: messages.title },
            ]}
          />
        </div>
        {content}
      </PageFrame>
    )
  }
  return (
    <PageFrame edge="bleed" className="gap-3">
      <SubPageHeader back={settingsLink} backLabel={messages.back} title={messages.title} />
      <div className="flex flex-col gap-5 px-4">
        <div className="flex flex-col gap-3">
          {canUpdate && <RequiredLegend />}
          <p className="text-body-sm text-ink-muted">{messages.lead(people.workspaceName)}</p>
        </div>
        {content}
      </div>
    </PageFrame>
  )
}

function ChargeTextContent(props: ChargeTextContentProps) {
  const { workspaceId } = props
  const saved = useQuery(chargeTextQueryOptions(workspaceId))
  const settings = useQuery(workspaceSettingsQueryOptions(workspaceId))
  const today = useQuery(todayQueryOptions(workspaceId))
  const failed = [saved, settings, today].find((query) => query.isError)
  const header = props.isDesktop && (
    <PageHeader title={messages.title} description={messages.description} />
  )
  if (failed) {
    return (
      <>
        {header}
        <SectionError
          message={messages.failed}
          errorRef={failed.error instanceof ApiError ? failed.error.ref : null}
          isRetrying={failed.isFetching}
          onRetry={() => void failed.refetch()}
        />
      </>
    )
  }
  if (!saved.data || !settings.data || !today.data) {
    return (
      <>
        {header}
        <SectionSkeleton lines={SKELETON_LINES} />
      </>
    )
  }
  return (
    <ChargeTextForm
      key={JSON.stringify(saved.data)}
      {...props}
      saved={saved.data}
      settings={settings.data}
      today={today.data}
    />
  )
}

function RequiredLegend() {
  return (
    <p className="text-note text-ink-muted">
      <span aria-hidden="true" className="font-semibold text-danger">
        {messages.requiredMark}
      </span>{' '}
      {messages.requiredLegend}
    </p>
  )
}
