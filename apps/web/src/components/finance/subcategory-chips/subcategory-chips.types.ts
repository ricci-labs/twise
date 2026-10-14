import type { ReactNode } from 'react'

export type SubcategoryChipsProps = {
  labels: readonly string[]
  chips: readonly ReactNode[]
  add?: ReactNode
  isExpanded: boolean
  onExpandedChange: (isExpanded: boolean) => void
  onHiddenCountChange?: (count: number) => void
}

export type ChipWidths = {
  chips: readonly number[]
  more: number
  add: number
  gap: number
}
