import { Button } from '@web/components/actions/button'
import { CategoryArt } from '@web/components/display/category-art'
import { Spinner } from '@web/components/feedback/spinner'
import { useOptOut } from '@web/features/contacts/api/use-opt-out'
import { contactsMessages } from '@web/features/contacts/contacts.messages'
import type { OptOutFrameProps, OptOutView } from '@web/features/contacts/contacts.types'
import { useCallOnce } from '@web/hooks/use-call-once'
import { useLinkToken } from '@web/hooks/use-link-token'
import { usePageTitle } from '@web/hooks/use-page-title'
import { ApiError } from '@web/lib/api/api-error'

const messages = contactsMessages.optOut
const TOO_MANY_ATTEMPTS = 'TOO_MANY_ATTEMPTS'
const TOGETHER = 'together'

export function OptOutPage() {
  usePageTitle(messages.pageTitle)
  const token = useLinkToken()
  const { mutate: optOut, isSuccess, data, error } = useOptOut()
  useCallOnce(token, optOut)
  const view = viewOf(token, isSuccess, error)
  if (view === 'confirming') {
    return (
      <OptOutFrame title={messages.confirming}>
        <Spinner />
      </OptOutFrame>
    )
  }
  const copy = copyOf(view, data?.requesterName ?? null)
  return (
    <OptOutFrame title={copy.title}>
      <p>{copy.text}</p>
      {view === 'failed' && token && (
        <Button variant="secondary" onClick={() => optOut(token)}>
          {messages.retry}
        </Button>
      )}
    </OptOutFrame>
  )
}

function OptOutFrame({ title, children }: OptOutFrameProps) {
  return (
    <main className="grid min-h-screen-safe place-items-center bg-page px-6 py-10 text-ink">
      <div className="flex max-w-110 flex-col items-center gap-3 text-center">
        <CategoryArt name={messages.art} icon={TOGETHER} size="2xl" />
        <h1 className="font-display text-title-lg">{title}</h1>
        <div className="flex flex-col items-center gap-4 text-body text-ink-muted">{children}</div>
        <p className="mt-4 text-note text-ink-muted">{messages.footer}</p>
      </div>
    </main>
  )
}

function copyOf(view: Exclude<OptOutView, 'confirming'>, requesterName: string | null) {
  if (view === 'done' && requesterName) {
    return {
      title: messages.doneBy.title(requesterName),
      text: messages.doneBy.text(requesterName),
    }
  }
  return messages.views[view]
}

function viewOf(token: string | null, isSuccess: boolean, error: Error | null): OptOutView {
  if (!token) {
    return 'linkInvalid'
  }
  if (isSuccess) {
    return 'done'
  }
  if (!error) {
    return 'confirming'
  }
  if (error instanceof ApiError && error.code === TOO_MANY_ATTEMPTS) {
    return 'paused'
  }
  return error instanceof ApiError && !error.isServerError ? 'linkInvalid' : 'failed'
}
