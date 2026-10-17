import type { ChargeTag } from '@financas/shared'
import type { chargeTextMarkVariants } from '@web/components/inputs/charge-text-editor/charge-text-editor.variants'
import type { VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'

export type ChargeTextEditorProps = Omit<
  ComponentProps<'textarea'>,
  'value' | 'onChange' | 'rows' | 'children'
> & {
  value: string
  onChange: (event: { target: { value: string } }) => void
  isSingleLine?: boolean
}

export type ChargeTextPart = {
  key: string
  text: string
  tone: NonNullable<VariantProps<typeof chargeTextMarkVariants>['tone']> | null
}

export type ChargeTagButtonsProps = {
  onInsert: (tag: ChargeTag) => void
  label?: string
  className?: string
}
