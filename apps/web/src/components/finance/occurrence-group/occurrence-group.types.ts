import type { occurrenceGroupListVariants } from '@web/components/finance/occurrence-group/occurrence-group.variants'
import type { VariantProps } from 'class-variance-authority'
import type { ReactNode } from 'react'

export type OccurrenceGroupProps = VariantProps<typeof occurrenceGroupListVariants> & {
  title: string
  count: number
  footer?: ReactNode
  children: ReactNode
}
