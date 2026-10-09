import type { ReactNode } from 'react'

export type AppShellProps = {
  sidebar: ReactNode
  bottomBar: ReactNode
  banner?: ReactNode
  floatingAction?: ReactNode
  children: ReactNode
}
