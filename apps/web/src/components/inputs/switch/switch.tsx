import { Switch as BaseSwitch } from '@base-ui/react/switch'
import type { SwitchProps } from '@web/components/inputs/switch/switch.types'
import {
  switchHelpVariants,
  switchRowVariants,
  switchTextVariants,
  switchThumbVariants,
  switchVariants,
} from '@web/components/inputs/switch/switch.variants'
import { cn } from '@web/lib/cn'
import { useId } from 'react'

export function Switch({
  id,
  label,
  help,
  isChecked,
  onCheckedChange,
  isDisabled = false,
  className,
}: SwitchProps) {
  const ownId = useId()
  const switchId = id ?? ownId
  const helpId = `${switchId}-help`
  return (
    <div data-slot="switch" className={cn(switchRowVariants(), className)}>
      <div className={switchTextVariants()}>
        <label htmlFor={switchId}>{label}</label>
        {help && (
          <p id={helpId} className={switchHelpVariants()}>
            {help}
          </p>
        )}
      </div>
      <BaseSwitch.Root
        id={switchId}
        nativeButton
        render={<button type="button" />}
        checked={isChecked}
        onCheckedChange={(checked) => onCheckedChange(checked)}
        disabled={isDisabled}
        aria-describedby={help ? helpId : undefined}
        className={switchVariants()}
      >
        <BaseSwitch.Thumb className={switchThumbVariants()} />
      </BaseSwitch.Root>
    </div>
  )
}
