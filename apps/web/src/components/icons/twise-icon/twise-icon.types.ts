import type { twiseIconVariants } from '@web/components/icons/twise-icon/twise-icon.variants'
import type { VariantProps } from 'class-variance-authority'
import type { ReactNode } from 'react'

export type TwiseIconName =
  | 'alert'
  | 'archive'
  | 'bag'
  | 'calendar'
  | 'card'
  | 'edit'
  | 'flag'
  | 'history'
  | 'home'
  | 'info'
  | 'list'
  | 'menu'
  | 'more'
  | 'move'
  | 'ok'
  | 'out'
  | 'plan'
  | 'plus'
  | 'shield'
  | 'sliders'
  | 'subcategory'
  | 'trash'
  | 'unarchive'
  | 'user'
  | 'users'
  | 'wallet'
  | 'warn'

export type TwiseIconShape = {
  fill?: ReactNode
  stroke: ReactNode
  weight?: number
}

export type TwiseIconProps = VariantProps<typeof twiseIconVariants> & {
  name: TwiseIconName
  className?: string
}
