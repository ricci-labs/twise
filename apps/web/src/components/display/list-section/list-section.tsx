import type { ListSectionProps } from '@web/components/display/list-section/list-section.types'
import {
  listSectionAsideVariants,
  listSectionEmptyVariants,
  listSectionTitleVariants,
  listSectionVariants,
} from '@web/components/display/list-section/list-section.variants'
import { useId } from 'react'

export function ListSection({ title, aside, empty, children }: ListSectionProps) {
  const titleId = useId()
  return (
    <section data-slot="list-section" aria-labelledby={titleId} className={listSectionVariants()}>
      <h2 id={titleId} className={listSectionTitleVariants()}>
        {title}
        {aside !== undefined && <small className={listSectionAsideVariants()}>{aside}</small>}
      </h2>
      {empty ? <p className={listSectionEmptyVariants()}>{empty}</p> : children}
    </section>
  )
}
