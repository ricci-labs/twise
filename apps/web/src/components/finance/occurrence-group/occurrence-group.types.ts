import type {
  occurrenceGroupListVariants,
  occurrenceGroupTitleVariants,
} from '@web/components/finance/occurrence-group/occurrence-group.variants'
import type { VariantProps } from 'class-variance-authority'
import type { ReactElement, ReactNode } from 'react'

export type OccurrenceGroupAdd = {
  label: string
  link?: ReactElement
  onPress?: () => void
}

export type OccurrenceGroupItemsProps = VariantProps<typeof occurrenceGroupListVariants> & {
  children?: ReactNode
}

export type OccurrenceGroupProps = VariantProps<typeof occurrenceGroupListVariants> &
  Pick<VariantProps<typeof occurrenceGroupTitleVariants>, 'heading'> & {
    title: string
    count?: number
    add?: OccurrenceGroupAdd
    note?: string
    empty?: string
    footer?: ReactNode
    children?: ReactNode
  }
