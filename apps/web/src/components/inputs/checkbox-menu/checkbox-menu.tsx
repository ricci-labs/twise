import { Menu } from '@base-ui/react/menu'
import { checkboxMenuMessages as messages } from '@web/components/inputs/checkbox-menu/checkbox-menu.messages'
import type {
  CheckboxMenuOption,
  CheckboxMenuProps,
} from '@web/components/inputs/checkbox-menu/checkbox-menu.types'
import {
  checkboxMenuBoxVariants,
  checkboxMenuClearVariants,
  checkboxMenuFootVariants,
  checkboxMenuItemVariants,
  checkboxMenuPopupVariants,
} from '@web/components/inputs/checkbox-menu/checkbox-menu.variants'
import { Check } from 'lucide-react'

export function CheckboxMenu({
  trigger,
  label,
  options,
  value,
  onChange,
  clearLabel = messages.clear,
}: CheckboxMenuProps) {
  const chosen = new Set(value)
  const toggle = (option: CheckboxMenuOption, isChecked: boolean) =>
    onChange(
      options
        .filter((each) => (each.value === option.value ? isChecked : chosen.has(each.value)))
        .map((each) => each.value),
    )
  return (
    <Menu.Root>
      <Menu.Trigger render={trigger} />
      <Menu.Portal>
        <Menu.Positioner side="bottom" align="start" sideOffset={6}>
          <Menu.Popup aria-label={label} className={checkboxMenuPopupVariants()}>
            {options.map((option) => (
              <Menu.CheckboxItem
                key={option.value}
                checked={chosen.has(option.value)}
                closeOnClick={false}
                onCheckedChange={(isChecked) => toggle(option, isChecked)}
                className={checkboxMenuItemVariants()}
              >
                <span aria-hidden="true" className={checkboxMenuBoxVariants()}>
                  <Menu.CheckboxItemIndicator render={<Check />} />
                </span>
                {option.label}
              </Menu.CheckboxItem>
            ))}
            <div className={checkboxMenuFootVariants()}>
              <Menu.Item
                closeOnClick={false}
                disabled={value.length === 0}
                onClick={() => onChange([])}
                className={checkboxMenuClearVariants()}
              >
                {clearLabel}
              </Menu.Item>
            </div>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}
