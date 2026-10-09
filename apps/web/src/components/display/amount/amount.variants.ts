import { cva } from 'class-variance-authority'

export const amountVariants = cva('whitespace-nowrap tabular-nums', {
  variants: {
    size: {
      sm: 'text-amount-sm',
      md: 'text-amount',
      lg: 'text-amount-lg',
      kpi: 'font-display text-amount-kpi',
      hero: 'text-amount-hero',
    },
    tone: {
      inherit: '',
      neutral: 'text-ink',
      income: 'text-income',
      expense: 'text-expense',
      danger: 'text-danger',
    },
  },
  defaultVariants: { size: 'md', tone: 'inherit' },
})

export const amountCentsVariants = cva('text-cents')
