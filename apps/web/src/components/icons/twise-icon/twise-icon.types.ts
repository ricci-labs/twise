import type { twiseIconVariants } from '@web/components/icons/twise-icon/twise-icon.variants'
import type { VariantProps } from 'class-variance-authority'
import type { ReactNode } from 'react'

export type TwiseIconName =
  | 'alert'
  | 'bag'
  | 'card'
  | 'history'
  | 'home'
  | 'info'
  | 'list'
  | 'menu'
  | 'ok'
  | 'out'
  | 'plan'
  | 'plus'
  | 'shield'
  | 'sliders'
  | 'trash'
  | 'user'
  | 'users'
  | 'wallet'
  | 'warn'

export type TwiseIconShape = {
  fill?: ReactNode
  stroke: ReactNode
}

export type TwiseIconProps = VariantProps<typeof twiseIconVariants> & {
  name: TwiseIconName
  className?: string
}
