import type {
  kpiBadgeVariants,
  kpiCardVariants,
} from '@web/components/display/kpi-card/kpi-card.variants'
import type { VariantProps } from 'class-variance-authority'
import type { ReactNode } from 'react'

export type KpiCardProps = VariantProps<typeof kpiCardVariants> & {
  label: string
  help?: ReactNode
  value: ReactNode
  badge?: ReactNode
  art?: ReactNode
  className?: string
  children?: ReactNode
}

export type KpiBadgeProps = VariantProps<typeof kpiBadgeVariants> & {
  children: ReactNode
}
