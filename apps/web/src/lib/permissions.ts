import type { AppModule, Permission, PermissionAction } from '@financas/shared'

export function hasPermission(
  permissions: readonly Permission[],
  module: AppModule,
  action: PermissionAction,
): boolean {
  return permissions.some(
    (permission) => permission.module === module && permission.action === action,
  )
}

export function isReadOnly(permissions: readonly Permission[]): boolean {
  return permissions.every((permission) => permission.action === 'view')
}
