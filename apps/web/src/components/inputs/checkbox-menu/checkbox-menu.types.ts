import type { ReactElement } from 'react'

export type CheckboxMenuOption = {
  value: string
  label: string
}

export type CheckboxMenuProps = {
  trigger: ReactElement
  label: string
  options: readonly CheckboxMenuOption[]
  value: readonly string[]
  onChange: (value: string[]) => void
  clearLabel?: string
}
