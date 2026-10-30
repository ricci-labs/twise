import type { BackLinkProps } from '@web/components/layout/sub-page-header'
import type { ReactElement, ReactNode } from 'react'

export type SettingsFormPageProps = {
  back: ReactElement<BackLinkProps>
  backLabel: string
  title: string
  readOnlyNote?: string
  footer?: ReactNode
  children: ReactNode
}
