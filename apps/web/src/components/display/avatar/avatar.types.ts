import type { avatarVariants } from '@web/components/display/avatar/avatar.variants'
import type { TwiseIconName } from '@web/components/icons/twise-icon'
import type { VariantProps } from 'class-variance-authority'

export type AvatarProps = VariantProps<typeof avatarVariants> & {
  name: string
  icon?: TwiseIconName
  className?: string
}
