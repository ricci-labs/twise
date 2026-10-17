import { Button } from '@web/components/actions/button'
import { Alert } from '@web/components/feedback/alert'
import { SubmitButton } from '@web/components/forms/submit-button'
import { contactsMessages } from '@web/features/contacts/contacts.messages'
import type { ContactFormFooterProps } from '@web/features/contacts/contacts.types'
import { useMediaQuery } from '@web/hooks/use-media-query'
import { DESKTOP_QUERY } from '@web/lib/breakpoints'

const messages = contactsMessages.form

export function ContactFormFooter({
  isEditing,
  isOnline,
  problem,
  onCancel,
}: ContactFormFooterProps) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  return (
    <>
      {problem && (
        <Alert tone="danger" isUrgent>
          {problem}
        </Alert>
      )}
      <div className="flex flex-col lg:flex-row-reverse lg:items-center lg:justify-between">
        <SubmitButton
          width="full"
          loadingLabel={isEditing ? messages.saving : messages.creating}
          requiresChange={isEditing}
          isBlocked={!isOnline}
          className="lg:w-auto"
        >
          {isEditing ? messages.save : messages.create}
        </SubmitButton>
        {isDesktop && (
          <Button variant="quiet" onClick={onCancel}>
            {messages.cancel}
          </Button>
        )}
      </div>
    </>
  )
}
