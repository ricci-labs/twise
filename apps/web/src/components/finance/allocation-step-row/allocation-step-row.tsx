import { CategoryArt } from '@web/components/display/category-art'
import { allocationStepRowMessages as messages } from '@web/components/finance/allocation-step-row/allocation-step-row.messages'
import type { AllocationStepRowProps } from '@web/components/finance/allocation-step-row/allocation-step-row.types'
import {
  allocationStepArtVariants,
  allocationStepBodyVariants,
  allocationStepDetailVariants,
  allocationStepGripVariants,
  allocationStepInvalidVariants,
  allocationStepPositionVariants,
  allocationStepRowVariants,
  allocationStepTitleVariants,
} from '@web/components/finance/allocation-step-row/allocation-step-row.variants'
import { TwiseIcon } from '@web/components/icons/twise-icon'
import { cn } from '@web/lib/cn'

export function AllocationStepRow({
  position,
  title,
  detail,
  art,
  isLifted = false,
  isInvalid = false,
  isReadOnly = false,
  invalidMessage = messages.invalid,
  gripProps,
  actions,
  className,
  ...props
}: AllocationStepRowProps) {
  return (
    <li
      data-slot="allocation-step-row"
      data-lifted={isLifted || undefined}
      data-invalid={isInvalid || undefined}
      className={cn(allocationStepRowVariants({ isLifted, isInvalid, isReadOnly }), className)}
      {...props}
    >
      {!isReadOnly && (
        <button
          type="button"
          data-slot="allocation-step-grip"
          aria-label={messages.grip}
          className={allocationStepGripVariants({ isLifted })}
          {...gripProps}
        >
          <TwiseIcon name="grip" size="sm" />
        </button>
      )}
      <CategoryArt
        name={art.name}
        icon={art.icon}
        size="md"
        className={allocationStepArtVariants({ isInvalid })}
      />
      <span className={allocationStepBodyVariants({ isReadOnly })}>
        <span className={allocationStepPositionVariants({ isInvalid })}>
          {messages.position(position)}
        </span>
        <span className={allocationStepTitleVariants()}>{title}</span>
        {detail && <span className={allocationStepDetailVariants()}>{detail}</span>}
        {isInvalid && (
          <span className={allocationStepInvalidVariants()}>
            <TwiseIcon name="alert" tone="danger" size="sm" />
            {invalidMessage}
          </span>
        )}
      </span>
      {!isReadOnly && actions}
    </li>
  )
}
