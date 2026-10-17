import type { actionGridVariants } from '@web/components/actions/action-grid/action-grid.variants'
import type { VariantProps } from 'class-variance-authority'
import type { ReactNode } from 'react'

export type ActionGridProps = VariantProps<typeof actionGridVariants> & {
  label?: string
  className?: string
  children: ReactNode
}
