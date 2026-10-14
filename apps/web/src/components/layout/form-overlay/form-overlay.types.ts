import type { FormEventHandler, ReactNode } from 'react'

export type FormOverlayProps = {
  title: string
  closeLabel: string
  isOpen: boolean
  onRequestClose: () => void
  banner?: ReactNode
  footer: ReactNode
  children: ReactNode
  onSubmit?: FormEventHandler<HTMLFormElement>
}
