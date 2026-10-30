import type { pageHeaderDescriptionVariants } from '@web/components/layout/page-header/page-header.variants'
import type { VariantProps } from 'class-variance-authority'
import type { ReactNode } from 'react'

export type PageHeaderProps = VariantProps<typeof pageHeaderDescriptionVariants> & {
  title: string
  description?: string
  actions?: ReactNode
}
