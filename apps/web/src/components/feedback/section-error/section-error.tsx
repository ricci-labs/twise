import { Button } from '@web/components/actions/button'
import { sectionErrorMessages as messages } from '@web/components/feedback/section-error/section-error.messages'
import type { SectionErrorProps } from '@web/components/feedback/section-error/section-error.types'
import {
  sectionErrorIconVariants,
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
        <TwiseIcon name="alert" tone="danger" size="md" />
      </span>
      <div className="flex flex-col items-start">
        <p className="text-body">{message}</p>
        {errorRef && (
          <p className="mt-0.5 text-body-sm text-ink-muted tabular-nums">
            {messages.code(errorRef)}
          </p>
        )}
        <Button
          variant="outline"
          size="sm"
          className="mt-2.5"
          isLoading={isRetrying}
          onClick={onRetry}
        >
          {messages.retry}
        </Button>
      </div>
    </div>
  )
}
