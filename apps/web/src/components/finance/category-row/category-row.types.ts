import type { ReactNode } from 'react'

export type CategoryRowProps = {
  name: string
  icon: string | null
  badge?: ReactNode
  detail?: string
  subcategoryCount?: number
  isOpen?: boolean
  onOpenChange?: (isOpen: boolean) => void
  actions?: ReactNode
  children?: ReactNode
}
