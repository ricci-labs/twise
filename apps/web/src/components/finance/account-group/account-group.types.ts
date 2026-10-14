import type { ReactElement, ReactNode } from 'react'

export type AccountGroupAdd = {
  label: string
  link?: ReactElement
  onPress?: () => void
}

export type AccountGroupProps = {
  title?: string
  add?: AccountGroupAdd
  note?: string
  loadingRows?: number
  children?: ReactNode
}
