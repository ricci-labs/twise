import type { ReactNode } from 'react'

export type FieldGroupProps = {
  label: string
  isRequired?: boolean
  help?: string
  note?: string
  error?: string
  children: ReactNode
}
