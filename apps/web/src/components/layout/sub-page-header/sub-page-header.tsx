import type { SubPageHeaderProps } from '@web/components/layout/sub-page-header/sub-page-header.types'
import {
  subPageBackVariants,
  subPageDescriptionVariants,
  subPageHeaderVariants,
  subPageTitleVariants,
} from '@web/components/layout/sub-page-header/sub-page-header.variants'
import { ChevronLeft } from 'lucide-react'
import { cloneElement } from 'react'

export function SubPageHeader({ back, backLabel, title, description }: SubPageHeaderProps) {
  return (
    <header data-slot="sub-page-header" className={subPageHeaderVariants()}>
      {cloneElement(
        back,
        { 'aria-label': backLabel, className: subPageBackVariants() },
        <ChevronLeft aria-hidden="true" />,
      )}
      <div className="min-w-0">
        <h1 className={subPageTitleVariants()}>{title}</h1>
        {description && <p className={subPageDescriptionVariants()}>{description}</p>}
      </div>
    </header>
  )
}
