import type { ReactNode } from 'react'

export type DetailSectionProps = {
  title: string
  action?: ReactNode
  children: ReactNode
}

export type DetailRowsProps = {
  children: ReactNode
}

export type DetailRowProps = {
  label: string
  children: ReactNode
}
