import type { badgeVariants } from '@web/components/display/badge/badge.variants'
import type { VariantProps } from 'class-variance-authority'
import type { ReactNode } from 'react'

export type BadgeProps = VariantProps<typeof badgeVariants> & {
  children: ReactNode
  className?: string
}
