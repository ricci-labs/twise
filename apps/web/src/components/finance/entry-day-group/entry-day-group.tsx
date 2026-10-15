import { entryDayGroupMessages as messages } from '@web/components/finance/entry-day-group/entry-day-group.messages'
import type { EntryDayGroupProps } from '@web/components/finance/entry-day-group/entry-day-group.types'
import {
  entryDayDetailVariants,
  entryDayGroupVariants,
  entryDayListVariants,
  entryDayTitleVariants,
} from '@web/components/finance/entry-day-group/entry-day-group.variants'
import { useId } from 'react'

export function EntryDayGroup({ title, detail, children }: EntryDayGroupProps) {
  const titleId = useId()
  return (
    <section
      data-slot="entry-day-group"
      aria-labelledby={titleId}
      className={entryDayGroupVariants()}
    >
      <h2 id={titleId} className={entryDayTitleVariants()}>
        {title}
        {detail && (
          <span className={entryDayDetailVariants()}>
            {messages.separator}
            {detail}
          </span>
        )}
      </h2>
      <ul className={entryDayListVariants()}>{children}</ul>
    </section>
  )
}
