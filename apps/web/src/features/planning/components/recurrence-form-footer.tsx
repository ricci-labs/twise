import { Button } from '@web/components/actions/button'
import { Alert } from '@web/components/feedback/alert'
import { SubmitButton } from '@web/components/forms/submit-button'
import { planningMessages } from '@web/features/planning/planning.messages'
import type {
  RecurrenceFormFooterProps,
  RecurrenceFormInput,
} from '@web/features/planning/planning.types'
import { useMediaQuery } from '@web/hooks/use-media-query'
import { DESKTOP_QUERY } from '@web/lib/breakpoints'
import { useWatch } from 'react-hook-form'

const messages = planningMessages.form

export function RecurrenceFormFooter({
  isOnline,
  problem,
  isEditing,
  onCancel,
}: RecurrenceFormFooterProps) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  const entryType = useWatch<RecurrenceFormInput, 'entryType'>({ name: 'entryType' })
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
          isBlocked={!isOnline}
          className="lg:w-auto"
        >
          {isEditing ? messages.save : messages.create[entryType]}
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
