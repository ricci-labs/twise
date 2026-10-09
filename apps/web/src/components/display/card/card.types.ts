import type { cardVariants } from '@web/components/display/card/card.variants'
import type { VariantProps } from 'class-variance-authority'
import type { ReactNode } from 'react'

export type CardProps = VariantProps<typeof cardVariants> & {
  title: string
  id?: string
  description?: ReactNode
  headerAction?: ReactNode
  footerStat?: ReactNode
  footerAction?: ReactNode
  children: ReactNode
  className?: string
}
