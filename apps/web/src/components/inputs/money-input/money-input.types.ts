import type { moneyBoxVariants } from '@web/components/inputs/money-input/money-input.variants'
import type { VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'

export type MoneyInputChange = { target: { value: string } }

export type MoneyInputProps = Omit<ComponentProps<'input'>, 'size' | 'onChange' | 'value'> &
  VariantProps<typeof moneyBoxVariants> & {
    value: string
    onChange: (event: MoneyInputChange) => void
    isNegative?: boolean
  }
