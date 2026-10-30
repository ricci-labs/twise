import type { ReactElement, ReactNode } from 'react'

export type SettingsRowLinkProps = {
  className?: string
  children?: ReactNode
}

export type SettingsRowProps = {
  title: string
  detail?: string
  icon: ReactNode
  link: ReactElement<SettingsRowLinkProps>
}
