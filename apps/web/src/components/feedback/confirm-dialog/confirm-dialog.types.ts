import type { TwiseIconName } from '@web/components/icons/twise-icon'
import type { ReactNode } from 'react'

export type ConfirmDialogProps = {
  title: string
  description: string
  cancelLabel: string
  confirmLabel: string
  confirmVariant?: 'danger' | 'primary'
  confirmIcon?: TwiseIconName
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onConfirm: () => void
  children?: ReactNode
}
