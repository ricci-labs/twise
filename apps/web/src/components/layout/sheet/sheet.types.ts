import type { ReactElement, ReactNode } from 'react'

export type SheetProps = {
  title: string
  trigger?: ReactElement
  isOpen?: boolean
  onOpenChange?: (isOpen: boolean) => void
  children: ReactNode
}
