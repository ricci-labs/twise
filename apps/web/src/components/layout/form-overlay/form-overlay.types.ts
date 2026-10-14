import type {
  formOverlayFootVariants,
  formOverlayPopupVariants,
} from '@web/components/layout/form-overlay/form-overlay.variants'
import type { VariantProps } from 'class-variance-authority'
import type { FormEventHandler, ReactNode, RefObject } from 'react'

export type FormOverlayProps = VariantProps<typeof formOverlayPopupVariants> &
  VariantProps<typeof formOverlayFootVariants> & {
    title: string
    closeLabel: string
    isOpen: boolean
    onRequestClose: () => void
    banner?: ReactNode
    footer: ReactNode
    children: ReactNode
    onSubmit?: FormEventHandler<HTMLFormElement>
    initialFocus?: RefObject<HTMLElement | null>
  }

export type FormOverlayContentProps = {
  onSubmit?: FormEventHandler<HTMLFormElement>
  children: ReactNode
}
