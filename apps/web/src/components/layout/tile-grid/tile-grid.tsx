import { useRender } from '@base-ui/react/use-render'
import type { TileGridProps } from '@web/components/layout/tile-grid/tile-grid.types'
import { tileGridVariants } from '@web/components/layout/tile-grid/tile-grid.variants'
import { cn } from '@web/lib/cn'

export function TileGrid({ render, density, className, ...props }: TileGridProps) {
  return useRender({
    render,
    defaultTagName: 'div',
    props: {
      ...props,
      'data-slot': 'tile-grid',
      className: cn(tileGridVariants({ density }), className),
    },
  })
}
