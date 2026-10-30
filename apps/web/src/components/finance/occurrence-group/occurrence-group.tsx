import { TextLink } from '@web/components/actions/text-link'
import { occurrenceGroupMessages as messages } from '@web/components/finance/occurrence-group/occurrence-group.messages'
import type {
  OccurrenceGroupItemsProps,
  OccurrenceGroupProps,
} from '@web/components/finance/occurrence-group/occurrence-group.types'
import {
  occurrenceGroupAddVariants,
  occurrenceGroupCountVariants,
  occurrenceGroupEmptyVariants,
  occurrenceGroupHeadVariants,
  occurrenceGroupListVariants,
  occurrenceGroupNoteVariants,
  occurrenceGroupTitleVariants,
  occurrenceGroupVariants,
} from '@web/components/finance/occurrence-group/occurrence-group.variants'
import { TileGrid } from '@web/components/layout/tile-grid'
import { Plus } from 'lucide-react'
import { useId } from 'react'

export function OccurrenceGroup({
  title,
  count,
  tone,
  layout,
  heading = 'section',
  add,
  note,
  empty,
  footer,
  children,
}: OccurrenceGroupProps) {
  const titleId = useId()
  const Title = heading === 'label' ? 'h3' : 'h2'
  return (
    <section
      data-slot="occurrence-group"
      aria-labelledby={titleId}
      className={occurrenceGroupVariants()}
    >
      <div className={occurrenceGroupHeadVariants({ heading })}>
        <Title id={titleId} className={occurrenceGroupTitleVariants({ heading, tone })}>
          {title}
          {count !== undefined && (
            <>
              <span aria-hidden="true" className={occurrenceGroupCountVariants()}>
                {count}
              </span>
              <span className="sr-only">{messages.count(count)}</span>
            </>
          )}
        </Title>
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
      {note && <p className={occurrenceGroupNoteVariants()}>{note}</p>}
      {empty && count === 0 ? (
        <p className={occurrenceGroupEmptyVariants()}>{empty}</p>
      ) : (
        <GroupItems tone={tone} layout={layout}>
          {children}
        </GroupItems>
      )}
      {footer}
    </section>
  )
}

function GroupItems({ tone, layout, children }: OccurrenceGroupItemsProps) {
  if (layout === 'cards') {
    return (
      <TileGrid density="compact" render={<ul />}>
        {children}
      </TileGrid>
    )
  }
  return <ul className={occurrenceGroupListVariants({ tone, layout })}>{children}</ul>
}
