import type {
  DetailRowProps,
  DetailRowsProps,
  DetailSectionProps,
} from '@web/components/display/detail-section/detail-section.types'
import {
  detailLabelVariants,
  detailRowsVariants,
  detailRowVariants,
  detailSectionHeadVariants,
  detailSectionTitleVariants,
  detailSectionVariants,
  detailValueVariants,
} from '@web/components/display/detail-section/detail-section.variants'
import { useId } from 'react'

export function DetailSection({ title, action, children }: DetailSectionProps) {
  const titleId = useId()
  return (
    <section
      data-slot="detail-section"
      aria-labelledby={titleId}
      className={detailSectionVariants()}
    >
      <div className={detailSectionHeadVariants()}>
        <h3 id={titleId} className={detailSectionTitleVariants()}>
          {title}
        </h3>
        {action}
      </div>
      {children}
    </section>
  )
}

export function DetailRows({ children }: DetailRowsProps) {
  return <dl className={detailRowsVariants()}>{children}</dl>
}

export function DetailRow({ label, children }: DetailRowProps) {
  return (
    <div className={detailRowVariants()}>
      <dt className={detailLabelVariants()}>{label}</dt>
      <dd className={detailValueVariants()}>{children}</dd>
    </div>
  )
}
