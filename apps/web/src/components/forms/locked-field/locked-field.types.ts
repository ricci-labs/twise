import type { lockedFieldTextVariants } from '@web/components/forms/locked-field/locked-field.variants'
import type { VariantProps } from 'class-variance-authority'

export type LockedFieldProps = VariantProps<typeof lockedFieldTextVariants> & {
  label: string
  value: string
  detail?: string
  help?: string
}
