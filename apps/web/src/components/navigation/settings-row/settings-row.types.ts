import type { settingsRowVariants } from '@web/components/navigation/settings-row/settings-row.variants'
import type { VariantProps } from 'class-variance-authority'
import type { ReactElement, ReactNode } from 'react'

export type SettingsRowLinkProps = {
  className?: string
  children?: ReactNode
}

export type SettingsRowProps = VariantProps<typeof settingsRowVariants> & {
  title: string
  detail?: string
  icon?: ReactNode
  isLocked?: boolean
  link: ReactElement<SettingsRowLinkProps>
}
