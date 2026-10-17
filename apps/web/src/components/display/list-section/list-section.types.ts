import type { ReactNode } from 'react'

export type ListSectionProps = {
  title: string
  aside?: ReactNode
  empty?: string
  children?: ReactNode
}
