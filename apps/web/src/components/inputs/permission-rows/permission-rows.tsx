import {
  type AppModule,
  isValidPermission,
  PERMISSION_ACTIONS,
  type Permission,
  type PermissionAction,
} from '@financas/shared'
import { TwiseIcon } from '@web/components/icons/twise-icon'
import { permissionRowsMessages as messages } from '@web/components/inputs/permission-rows/permission-rows.messages'
import type {
  PermissionAreaProps,
  PermissionRowsProps,
  PermissionToggleProps,
} from '@web/components/inputs/permission-rows/permission-rows.types'
import {
  permissionAreaTitleVariants,
  permissionAreaVariants,
  permissionGridVariants,
  permissionRowsVariants,
  permissionToggleVariants,
} from '@web/components/inputs/permission-rows/permission-rows.variants'
import { Check } from 'lucide-react'

const VIEW = 'view'

export function PermissionRows({
  label,
  areas,
  value,
  allowed,
  isDisabled = false,
  onChange,
}: PermissionRowsProps) {
  return (
    <fieldset
      aria-label={label}
      data-slot="permission-rows"
      data-disabled={isDisabled || undefined}
      className={permissionRowsVariants()}
    >
      {areas.map((area) => (
        <PermissionArea key={area.module} title={area.label}>
          {PERMISSION_ACTIONS.filter((action) =>
            isValidPermission({ module: area.module, action }),
          ).map((action) => (
            <PermissionToggle
              key={action}
              module={area.module}
              action={action}
              isOn={holds(value, area.module, action)}
              isLocked={!holds(allowed, area.module, action)}
              isDisabled={isDisabled}
              onToggle={(isOn) => onChange(toggled(value, area.module, action, isOn))}
            />
          ))}
        </PermissionArea>
      ))}
    </fieldset>
  )
}

export function toggled(
  value: readonly Permission[],
  module: AppModule,
  action: PermissionAction,
  isOn: boolean,
): Permission[] {
  const others = value.filter((permission) => permission.module !== module)
  const ofModule = value.filter((permission) => permission.module === module)
  if (!isOn) {
    return action === VIEW
      ? others
      : [...others, ...ofModule.filter((permission) => permission.action !== action)]
  }
  const wanted = new Set([...ofModule.map((permission) => permission.action), action, VIEW])
  return [
    ...others,
    ...PERMISSION_ACTIONS.filter((candidate) => wanted.has(candidate)).map((candidate) => ({
      module,
      action: candidate,
    })),
  ]
}

function PermissionArea({ title, children }: PermissionAreaProps) {
  return (
    <fieldset className={permissionAreaVariants()}>
      <legend className={permissionAreaTitleVariants()}>{title}</legend>
      <div className={permissionGridVariants()}>{children}</div>
    </fieldset>
  )
}

function PermissionToggle({
  module,
  action,
  isOn,
  isLocked,
  isDisabled,
  onToggle,
}: PermissionToggleProps) {
  return (
    <button
      type="button"
      data-module={module}
      aria-pressed={isOn}
      disabled={isDisabled || isLocked}
      title={isLocked ? messages.locked : undefined}
      onClick={() => onToggle(!isOn)}
      className={permissionToggleVariants({ column: action })}
    >
      {isLocked && <TwiseIcon name="lock" size="sm" />}
      {isOn && !isLocked && <Check aria-hidden="true" />}
      {messages.actions[action]}
    </button>
  )
}

function holds(permissions: readonly Permission[], module: AppModule, action: PermissionAction) {
  return permissions.some(
    (permission) => permission.module === module && permission.action === action,
  )
}
