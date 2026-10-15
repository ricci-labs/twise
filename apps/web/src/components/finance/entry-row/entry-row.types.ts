import type { entryRowAmountVariants } from '@web/components/finance/entry-row/entry-row.variants'
import type { VariantProps } from 'class-variance-authority'
import type { ReactElement, ReactNode } from 'react'

export type EntryRowLinkProps = {
  className?: string
  children?: ReactNode
}

export type EntryDirection = NonNullable<VariantProps<typeof entryRowAmountVariants>['direction']>

export type EntryRowProps = {
  description: string
  detail: string
  art: { name: string; icon: string | null }
  amountCents: number
  direction: EntryDirection
  installmentCount?: number
  isShared?: boolean
  hasReceipt?: boolean
  search?: string
  link?: ReactElement<EntryRowLinkProps>
}

export type EntryTitleProps = Pick<
  EntryRowProps,
  'description' | 'installmentCount' | 'isShared' | 'hasReceipt' | 'search'
>
