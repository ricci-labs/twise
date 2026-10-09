import type { avatarVariants } from '@web/components/display/avatar/avatar.variants'
import type { VariantProps } from 'class-variance-authority'

export type AvatarProps = VariantProps<typeof avatarVariants> & {
  name: string
  className?: string
}
