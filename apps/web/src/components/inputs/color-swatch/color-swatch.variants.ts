import { cva } from 'class-variance-authority'

export const colorSwatchVariants = cva('inline-block shrink-0 rounded-full bg-data-color', {
  variants: {
    size: {
      dot: 'size-2.25',
      swatch: 'size-9',
    },
  },
  defaultVariants: { size: 'dot' },
})
