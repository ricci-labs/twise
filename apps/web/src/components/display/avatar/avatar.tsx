import type { AvatarProps } from '@web/components/display/avatar/avatar.types'
import { avatarVariants } from '@web/components/display/avatar/avatar.variants'
import { TwiseIcon } from '@web/components/icons/twise-icon'
import { cn } from '@web/lib/cn'

export function Avatar({ name, icon, tone, size, className }: AvatarProps) {
  return (
    <span
      data-slot="avatar"
      aria-hidden="true"
      className={cn(avatarVariants({ tone, size }), className)}
    >
      {icon ? <TwiseIcon name={icon} /> : initialOf(name)}
    </span>
  )
}

function initialOf(name: string): string {
  return name.trim().charAt(0).toLocaleUpperCase('pt-BR')
}
