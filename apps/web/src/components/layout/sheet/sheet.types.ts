import type { ReactElement, ReactNode } from 'react'

export type SheetProps = {
  title: string
  description?: string
  closeLabel?: string
  trigger?: ReactElement
  anchor?: Element | null
  isOpen?: boolean
  onOpenChange?: (isOpen: boolean) => void
  children: ReactNode
}

export type SheetBodyProps = Omit<SheetProps, 'anchor'>

export type SheetAnchoredProps = SheetBodyProps & {
  anchor: Element
}
