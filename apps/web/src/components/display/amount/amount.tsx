import { formatBrl } from '@financas/shared'
import type { AmountParts, AmountProps } from '@web/components/display/amount/amount.types'
import { amountCentsVariants, amountVariants } from '@web/components/display/amount/amount.variants'
import { cn } from '@web/lib/cn'

const MINUS = '−'

export function Amount({
  cents,
  sign = 'auto',
  isCentsRaised = false,
  size,
  tone,
  className,
}: AmountProps) {
  const parts = amountParts(cents, sign)
  return (
    <span data-slot="amount" className={cn(amountVariants({ size, tone }), className)}>
      {parts.sign}
      {parts.whole}
      {isCentsRaised ? <span className={amountCentsVariants()}>{parts.cents}</span> : parts.cents}
    </span>
  )
}

export function amountParts(cents: number, sign: AmountProps['sign'] = 'auto'): AmountParts {
  const formatted = formatBrl(Math.abs(cents))
  const comma = formatted.lastIndexOf(',')
  return {
    sign: signOf(cents, sign),
    whole: formatted.slice(0, comma),
    cents: formatted.slice(comma),
  }
}

function signOf(cents: number, sign: AmountProps['sign']): string {
  if (cents < 0) {
    return MINUS
  }
  return sign === 'always' && cents > 0 ? '+' : ''
}
