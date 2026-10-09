import type { TwiseIconName } from '@web/components/icons/twise-icon'
import type { navLinkVariants } from '@web/components/navigation/nav-link/nav-link.variants'
import type { VariantProps } from 'class-variance-authority'
import type { ComponentProps, ReactElement } from 'react'

export type NavItem = {
  key: string
  label: string
  icon: TwiseIconName
  render: ReactElement
  isCurrent?: boolean
}

export type NavLinkProps = Omit<ComponentProps<'a'>, 'children'> &
  VariantProps<typeof navLinkVariants> & {
    item: NavItem
  }
