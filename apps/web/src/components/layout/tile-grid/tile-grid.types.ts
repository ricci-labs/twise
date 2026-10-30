import type { tileGridVariants } from '@web/components/layout/tile-grid/tile-grid.variants'
import type { VariantProps } from 'class-variance-authority'
import type { ComponentProps, ReactElement } from 'react'

export type TileGridProps = ComponentProps<'div'> &
  VariantProps<typeof tileGridVariants> & {
    render?: ReactElement
  }
