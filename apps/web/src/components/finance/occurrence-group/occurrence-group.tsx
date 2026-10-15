import { occurrenceGroupMessages as messages } from '@web/components/finance/occurrence-group/occurrence-group.messages'
import type { OccurrenceGroupProps } from '@web/components/finance/occurrence-group/occurrence-group.types'
import {
  occurrenceGroupCountVariants,
  occurrenceGroupHeadVariants,
  occurrenceGroupListVariants,
  occurrenceGroupTitleVariants,
  occurrenceGroupVariants,
} from '@web/components/finance/occurrence-group/occurrence-group.variants'
import { useId } from 'react'

export function OccurrenceGroup({
  title,
  count,
  tone,
  action,
  footer,
  children,
}: OccurrenceGroupProps) {
  const titleId = useId()
  return (
    <section
      data-slot="occurrence-group"
      aria-labelledby={titleId}
      className={occurrenceGroupVariants()}
    >
      <div className={occurrenceGroupHeadVariants()}>
        <h2 id={titleId} className={occurrenceGroupTitleVariants({ tone })}>
          {title}
          <span aria-hidden="true" className={occurrenceGroupCountVariants()}>
            {count}
          </span>
          <span className="sr-only">{messages.count(count)}</span>
        </h2>
        {action}
      </div>
      <ul className={occurrenceGroupListVariants({ tone })}>{children}</ul>
      {footer}
    </section>
  )
}
