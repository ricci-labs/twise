import type { PageHeaderProps } from '@web/components/layout/page-header/page-header.types'
import {
  pageHeaderActionsVariants,
  pageHeaderDescriptionVariants,
  pageHeaderTitleVariants,
  pageHeaderVariants,
} from '@web/components/layout/page-header/page-header.variants'

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <header data-slot="page-header" className={pageHeaderVariants()}>
      <div className="min-w-0">
        <h1 className={pageHeaderTitleVariants()}>{title}</h1>
        {description && <p className={pageHeaderDescriptionVariants()}>{description}</p>}
      </div>
      {actions && <div className={pageHeaderActionsVariants()}>{actions}</div>}
    </header>
  )
}
