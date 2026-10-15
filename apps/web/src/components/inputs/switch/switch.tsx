import { Switch as BaseSwitch } from '@base-ui/react/switch'
import type { SwitchProps } from '@web/components/inputs/switch/switch.types'
import {
  switchLabelVariants,
  switchRowVariants,
  switchThumbVariants,
  switchVariants,
} from '@web/components/inputs/switch/switch.variants'
import { cn } from '@web/lib/cn'
import { useId } from 'react'

export function Switch({
  id,
  label,
  isChecked,
  onCheckedChange,
  isDisabled = false,
  className,
}: SwitchProps) {
  const ownId = useId()
  const switchId = id ?? ownId
  return (
    <div data-slot="switch" className={cn(switchRowVariants(), className)}>
      <label htmlFor={switchId} className={switchLabelVariants()}>
        {label}
      </label>
      <BaseSwitch.Root
        id={switchId}
        nativeButton
        render={<button type="button" />}
        checked={isChecked}
        onCheckedChange={(checked) => onCheckedChange(checked)}
        disabled={isDisabled}
        className={switchVariants()}
      >
        <BaseSwitch.Thumb className={switchThumbVariants()} />
      </BaseSwitch.Root>
    </div>
  )
}
