import type { colorSwatchVariants } from '@web/components/inputs/color-swatch/color-swatch.variants'
import type { VariantProps } from 'class-variance-authority'
import type { CSSProperties } from 'react'

export type ColorSwatchProps = VariantProps<typeof colorSwatchVariants> & {
  color: string | null
  className?: string
}

export type DataColorStyle = CSSProperties & {
  '--data-color': string
  '--data-color-on-dark'?: string
}
