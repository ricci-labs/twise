import type { BreadcrumbProps } from '@web/components/navigation/breadcrumb/breadcrumb.types'
import {
  breadcrumbLinkVariants,
  breadcrumbVariants,
} from '@web/components/navigation/breadcrumb/breadcrumb.variants'
import { ChevronRight } from 'lucide-react'
import { cloneElement, Fragment } from 'react'

export function Breadcrumb({ label, items }: BreadcrumbProps) {
  return (
    <nav aria-label={label} data-slot="breadcrumb" className={breadcrumbVariants()}>
      {items.map((item, position) => (
        <Fragment key={item.label}>
          {position > 0 && <ChevronRight aria-hidden="true" />}
          {item.link ? (
            cloneElement(item.link, { className: breadcrumbLinkVariants() }, item.label)
          ) : (
            <span aria-current="page">{item.label}</span>
          )}
        </Fragment>
      ))}
    </nav>
  )
}
