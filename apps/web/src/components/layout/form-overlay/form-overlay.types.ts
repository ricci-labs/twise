import type { FormEventHandler, ReactNode, RefObject } from 'react'

export type FormOverlayProps = {
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
