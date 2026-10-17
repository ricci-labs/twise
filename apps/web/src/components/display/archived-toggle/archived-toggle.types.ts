import type { archivedToggleMessages } from '@web/components/display/archived-toggle/archived-toggle.messages'
import type { ReactNode } from 'react'

export type ArchivedToggleGender = keyof typeof archivedToggleMessages.label

export type ArchivedToggleProps = {
  count: number
  gender?: ArchivedToggleGender
  children: ReactNode
  isOpen?: boolean
  onOpenChange?: (isOpen: boolean) => void
}
