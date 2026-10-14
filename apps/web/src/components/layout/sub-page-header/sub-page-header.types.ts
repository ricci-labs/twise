import type { ReactElement, ReactNode } from 'react'

export type BackLinkProps = {
  className?: string
  'aria-label'?: string
  children?: ReactNode
}

export type SubPageHeaderProps = {
  back: ReactElement<BackLinkProps>
  backLabel: string
  title: string
  description?: string
  actions?: ReactNode
}
