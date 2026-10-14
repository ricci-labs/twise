import { Button } from '@web/components/actions/button'
import { Alert } from '@web/components/feedback/alert'
import { SubmitButton } from '@web/components/forms/submit-button'
import { entriesMessages } from '@web/features/entries/entries.messages'
import type { FormFooterProps } from '@web/features/entries/entries.types'
import { useMediaQuery } from '@web/hooks/use-media-query'
import { DESKTOP_QUERY } from '@web/lib/breakpoints'
import { useFormContext, useFormState } from 'react-hook-form'

const messages = entriesMessages.newEntry

export function FormFooter({ isOnline, problem, onCancel }: FormFooterProps) {
  const { trigger } = useFormContext()
  const { isValid, isSubmitting } = useFormState()
  const isDesktop = useMediaQuery(DESKTOP_QUERY)

  return (
    <>
      {problem && (
        <Alert tone="danger" isUrgent>
          {problem}
        </Alert>
      )}
      <div className="flex flex-col gap-0.5 lg:flex-row-reverse lg:items-center lg:gap-2.5">
        <SubmitButton
          width="full"
          loadingLabel={messages.saving}
          isBlocked={!isOnline}
          className="lg:w-auto"
        >
          {messages.save}
        </SubmitButton>
        <Button
          type="submit"
          variant={isDesktop ? 'secondary' : 'quiet'}
          size={isDesktop ? 'md' : 'touch'}
          className="lg:w-auto"
          width="full"
          isDisabled={!isValid || isSubmitting || !isOnline}
          onDisabledPress={() => {
            if (isOnline && !isSubmitting) {
              void trigger(undefined, { shouldFocus: true })
            }
          }}
          data-after-save="another"
        >
          {messages.saveAnother}
        </Button>
        {isDesktop && (
          <Button variant="quiet" className="mr-auto" onClick={onCancel}>
            {messages.close}
          </Button>
        )}
      </div>
    </>
  )
}
