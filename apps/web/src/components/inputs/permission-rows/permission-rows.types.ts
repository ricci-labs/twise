import type { AppModule, Permission, PermissionAction } from '@financas/shared'
import type { ReactNode } from 'react'

export type PermissionArea = {
  module: AppModule
  label: string
}

export type PermissionRowsProps = {
  label: string
  areas: readonly PermissionArea[]
  value: readonly Permission[]
  allowed: readonly Permission[]
  isDisabled?: boolean
  layout?: 'rows' | 'matrix'
  onChange: (next: Permission[]) => void
}

export type PermissionToggleProps = {
  module: AppModule
  action: PermissionAction
  isOn: boolean
  isLocked: boolean
  isDisabled: boolean
  onToggle: (isOn: boolean) => void
}

export type PermissionAreaProps = {
  title: string
  children: ReactNode
}

export type PermissionCheckboxProps = {
  area: string
  action: PermissionAction
  isOn: boolean
  isLocked: boolean
  isDisabled: boolean
  onToggle: (isOn: boolean) => void
}
