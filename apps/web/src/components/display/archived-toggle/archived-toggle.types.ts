import type { ReactNode } from 'react'

export type ArchivedToggleProps = {
  count: number
  children: ReactNode
  isOpen?: boolean
  onOpenChange?: (isOpen: boolean) => void
}
