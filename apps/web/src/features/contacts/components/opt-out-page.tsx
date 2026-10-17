import { Button } from '@web/components/actions/button'
import { Spinner } from '@web/components/feedback/spinner'
import { MomentScreen } from '@web/components/layout/moment-screen'
import { useOptOut } from '@web/features/contacts/api/use-opt-out'
import { contactsMessages } from '@web/features/contacts/contacts.messages'
import type { OptOutView } from '@web/features/contacts/contacts.types'
import { useCallOnce } from '@web/hooks/use-call-once'
import { useLinkToken } from '@web/hooks/use-link-token'
import { usePageTitle } from '@web/hooks/use-page-title'
import { ApiError } from '@web/lib/api/api-error'

const messages = contactsMessages.optOut
const TOO_MANY_ATTEMPTS = 'TOO_MANY_ATTEMPTS'

export function OptOutPage() {
  usePageTitle(messages.pageTitle)
  const token = useLinkToken()
  const { mutate: optOut, isSuccess, error } = useOptOut()
  useCallOnce(token, optOut)
  const view = viewOf(token, isSuccess, error)
  if (view === 'confirming') {
    return (
      <MomentScreen tone="calm" scene="together" isStill title={messages.confirming}>
        <Spinner />
      </MomentScreen>
    )
  }
  return (
    <MomentScreen
      tone="calm"
      scene="together"
      isStill
      title={messages.views[view].title}
      actions={
        view === 'failed' &&
        token && (
          <Button variant="secondary" onClick={() => optOut(token)}>
            {messages.retry}
          </Button>
        )
      }
    >
      <p>{messages.views[view].text}</p>
    </MomentScreen>
  )
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
