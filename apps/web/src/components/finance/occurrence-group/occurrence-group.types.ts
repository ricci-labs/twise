import type { occurrenceGroupListVariants } from '@web/components/finance/occurrence-group/occurrence-group.variants'
import type { VariantProps } from 'class-variance-authority'
import type { ReactElement, ReactNode } from 'react'

export type OccurrenceGroupAdd = {
  label: string
  link?: ReactElement
  onPress?: () => void
}

export type OccurrenceGroupProps = VariantProps<typeof occurrenceGroupListVariants> & {
  title: string
  count: number
  add?: OccurrenceGroupAdd
  note?: string
  empty?: string
  footer?: ReactNode
  children?: ReactNode
}
