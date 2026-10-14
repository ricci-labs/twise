import icon from '@web/assets/brand/icon.svg'
import logo from '@web/assets/brand/logo.svg'
import { logoMessages } from '@web/components/brand/logo/logo.messages'
import type { LogoProps } from '@web/components/brand/logo/logo.types'
import {
  logoLockupIconVariants,
  logoVariants,
  logoWordmarkVariants,
} from '@web/components/brand/logo/logo.variants'
import { cn } from '@web/lib/cn'

export function Logo({ variant = 'full', className }: LogoProps) {
  if (variant === 'lockup') {
    return (
      <span
        data-slot="logo"
        role="img"
        aria-label={logoMessages.name}
        className={cn(logoVariants({ variant }), className)}
      >
        <img src={icon} alt="" draggable={false} className={logoLockupIconVariants()} />
        <span aria-hidden="true" className={logoWordmarkVariants()}>
          {logoMessages.name}
        </span>
      </span>
    )
  }
  return (
    <img
      data-slot="logo"
      src={variant === 'full' ? logo : icon}
      alt={logoMessages.name}
      draggable={false}
      className={cn(logoVariants({ variant }), className)}
    />
  )
}
