import { formatBrl } from '@financas/shared'
import { beforeAfterTilesMessages as messages } from '@web/components/display/before-after-tiles/before-after-tiles.messages'
import type {
  BeforeAfterTileProps,
  BeforeAfterTilesProps,
} from '@web/components/display/before-after-tiles/before-after-tiles.types'
import {
  beforeAfterBeforeVariants,
  beforeAfterLabelVariants,
  beforeAfterTextVariants,
  beforeAfterTilesVariants,
  beforeAfterTileVariants,
  beforeAfterValueVariants,
} from '@web/components/display/before-after-tiles/before-after-tiles.variants'

export function BeforeAfterTiles({ items, layout = 'rows' }: BeforeAfterTilesProps) {
  return (
    <ul data-slot="before-after-tiles" className={beforeAfterTilesVariants({ layout })}>
      {items.map((item) => (
        <BeforeAfterTile key={item.label} item={item} layout={layout} />
      ))}
    </ul>
  )
}

function BeforeAfterTile({ item, layout }: BeforeAfterTileProps) {
  const isUnchanged = item.beforeCents === item.afterCents
  return (
    <li data-slot="before-after-tile" className={beforeAfterTileVariants({ layout })}>
      <span className={beforeAfterTextVariants({ layout })}>
        <span className={beforeAfterLabelVariants({ layout })}>{item.label}</span>
        <span className={beforeAfterBeforeVariants({ layout })}>
          {isUnchanged ? messages.unchanged : messages.before(formatBrl(item.beforeCents))}
        </span>
      </span>
      <strong className={beforeAfterValueVariants({ layout, isNegative: item.afterCents < 0 })}>
        {formatBrl(item.afterCents)}
      </strong>
    </li>
  )
}
