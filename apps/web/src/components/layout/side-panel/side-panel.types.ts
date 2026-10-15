import type { ReactNode } from 'react'

export type SidePanelProps = {
  title: string
  closeLabel: string
  onClose: () => void
  actions?: ReactNode
  children: ReactNode
}
