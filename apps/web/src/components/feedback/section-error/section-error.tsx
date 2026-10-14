import { Button } from '@web/components/actions/button'
import { sectionErrorMessages as messages } from '@web/components/feedback/section-error/section-error.messages'
import type { SectionErrorProps } from '@web/components/feedback/section-error/section-error.types'
import {
  sectionErrorCodeVariants,
  sectionErrorIconVariants,
  sectionErrorMessageVariants,
  sectionErrorRetryVariants,
  sectionErrorVariants,
} from '@web/components/feedback/section-error/section-error.variants'
import { TwiseIcon } from '@web/components/icons/twise-icon'
import { cn } from '@web/lib/cn'

export function SectionError({
  message,
  errorRef,
  onRetry,
  isRetrying = false,
  className,
}: SectionErrorProps) {
  return (
    <div data-slot="section-error" role="alert" className={cn(sectionErrorVariants(), className)}>
      <span className={sectionErrorIconVariants()}>
        <TwiseIcon name="alert" tone="danger" size="xl" />
      </span>
      <div className="flex flex-col items-start">
        <p className={sectionErrorMessageVariants()}>{message}</p>
        {errorRef && <p className={sectionErrorCodeVariants()}>{messages.code(errorRef)}</p>}
        <Button
          variant="secondary"
          size="sm"
          className={sectionErrorRetryVariants()}
          isLoading={isRetrying}
          onClick={onRetry}
        >
          <TwiseIcon name="refresh" size="md" />
          {messages.retry}
        </Button>
      </div>
    </div>
  )
}
