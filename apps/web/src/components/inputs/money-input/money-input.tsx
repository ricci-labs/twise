import { moneyInputMessages } from '@web/components/inputs/money-input/money-input.messages'
import type { MoneyInputProps } from '@web/components/inputs/money-input/money-input.types'
import {
  moneyAffixVariants,
  moneyBoxVariants,
  moneySignVariants,
  moneyValueVariants,
} from '@web/components/inputs/money-input/money-input.variants'
import { cn } from '@web/lib/cn'
import { tidyTypedAmount } from '@web/lib/format/money'

export function MoneyInput({
  size,
  isNegative = false,
  value,
  onChange,
  onBlur,
  className,
  placeholder = moneyInputMessages.placeholder,
  ...props
}: MoneyInputProps) {
  return (
    <div data-slot="money-input" className={cn(moneyBoxVariants({ size }), className)}>
      {isNegative && (
        <span aria-hidden="true" data-slot="sign" className={moneySignVariants({ size })}>
          {moneyInputMessages.minus}
        </span>
      )}
      <span
        aria-hidden="true"
        data-slot="currency"
        className={moneyAffixVariants({ size, isNegative })}
      >
        {moneyInputMessages.currency}
      </span>
      <input
        type="text"
        inputMode="decimal"
        autoComplete="off"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange({ target: { value: event.target.value } })}
        onBlur={(event) => {
          const tidy = tidyTypedAmount(event.target.value)
          if (tidy !== event.target.value) {
            onChange({ target: { value: tidy } })
          }
          onBlur?.(event)
        }}
        className={moneyValueVariants({ size, isNegative })}
        {...props}
      />
    </div>
  )
}
