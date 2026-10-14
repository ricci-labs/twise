import type {
  ColorSwatchProps,
  DataColorStyle,
} from '@web/components/inputs/color-swatch/color-swatch.types'
import { colorSwatchVariants } from '@web/components/inputs/color-swatch/color-swatch.variants'
import { cn } from '@web/lib/cn'
import { ACCOUNT_COLORS } from '@web/styles/account-colors'

export function ColorSwatch({ color, size, className }: ColorSwatchProps) {
  if (!color) {
    return null
  }
  return (
    <span
      aria-hidden="true"
      data-slot="color-swatch"
      className={cn(colorSwatchVariants({ size }), className)}
      style={dataColorStyle(color)}
    />
  )
}

export function dataColorStyle(color: string): DataColorStyle {
  const choice = ACCOUNT_COLORS.find((candidate) => candidate.value === color)
  const onDark = choice && 'onDark' in choice ? choice.onDark : undefined
  return onDark
    ? { '--data-color': color, '--data-color-on-dark': onDark }
    : { '--data-color': color }
}
