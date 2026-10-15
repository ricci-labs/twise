import type { linkedItemVariants } from '@web/components/finance/linked-item/linked-item.variants'
import type { TwiseIconName } from '@web/components/icons/twise-icon'
import type { VariantProps } from 'class-variance-authority'
import type { ReactElement, ReactNode } from 'react'

export type LinkedItemLinkProps = {
  className?: string
  children?: ReactNode
}

export type LinkedItemProps = VariantProps<typeof linkedItemVariants> & {
  icon: TwiseIconName
  label: string
  link: ReactElement<LinkedItemLinkProps>
}
