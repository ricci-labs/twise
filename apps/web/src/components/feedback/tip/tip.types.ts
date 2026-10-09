import type { tipVariants } from '@web/components/feedback/tip/tip.variants'
import type { VariantProps } from 'class-variance-authority'
import type { ReactNode } from 'react'

export type TipProps = VariantProps<typeof tipVariants> & {
  className?: string
  children: ReactNode
}
