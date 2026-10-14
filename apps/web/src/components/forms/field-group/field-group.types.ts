import type { ReactNode } from 'react'

export type FieldGroupProps = {
  label: string
  isRequired?: boolean
  help?: string
  error?: string
  children: ReactNode
}
