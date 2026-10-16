import { TextLink } from '@web/components/actions/text-link'
import { occurrenceGroupMessages as messages } from '@web/components/finance/occurrence-group/occurrence-group.messages'
import type { OccurrenceGroupProps } from '@web/components/finance/occurrence-group/occurrence-group.types'
import {
  occurrenceGroupAddVariants,
  occurrenceGroupCountVariants,
  occurrenceGroupHeadVariants,
  occurrenceGroupListVariants,
  occurrenceGroupTitleVariants,
  occurrenceGroupVariants,
} from '@web/components/finance/occurrence-group/occurrence-group.variants'
import { Plus } from 'lucide-react'
import { useId } from 'react'

export function OccurrenceGroup({
  title,
  count,
  tone,
  layout,
  add,
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
        {add && (
          <TextLink
            render={add.link ?? <button type="button" />}
            onClick={add.onPress}
            className={occurrenceGroupAddVariants()}
          >
            <Plus aria-hidden="true" />
            {add.label}
          </TextLink>
        )}
      </div>
      <ul className={occurrenceGroupListVariants({ tone, layout })}>{children}</ul>
      {footer}
    </section>
  )
}
