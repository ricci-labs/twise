import { Link } from '@tanstack/react-router'
import { Button } from '@web/components/actions/button'
import { OwlScene } from '@web/components/brand/owl-scene'
import { workspacesMessages } from '@web/features/workspaces/workspaces.messages'
import type { ComingSoonPageProps } from '@web/features/workspaces/workspaces.types'
import { usePageTitle } from '@web/hooks/use-page-title'

const messages = workspacesMessages.comingSoon

export function ComingSoonPage({ workspaceId }: ComingSoonPageProps) {
  usePageTitle(messages.pageTitle)
  return (
    <section className="mx-auto flex w-full max-w-100 flex-1 flex-col items-center justify-center gap-4 px-4 py-10 text-center">
      <OwlScene scene="wait" className="w-48" />
      <h1 className="text-title-lg">{messages.title}</h1>
      <p className="text-body text-ink-muted">{messages.text}</p>
      <Button variant="outline" render={<Link to="/w/$workspaceId" params={{ workspaceId }} />}>
        {messages.backHome}
      </Button>
    </section>
  )
}
