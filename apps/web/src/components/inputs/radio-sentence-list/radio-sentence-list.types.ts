import type { ReactNode } from 'react'

export type RadioSentence = {
  value: string
  label: string
  before: string
  picker?: ReactNode
  after?: string
}

export type RadioSentenceListProps = {
  label: string
  options: readonly RadioSentence[]
  value: string
  onSelect: (value: string) => void
  onBlur?: () => void
  disabled?: boolean
  className?: string
}
