import type { AddTileProps } from '@web/components/actions/add-tile/add-tile.types'
import {
  addTileTextVariants,
  addTileTitleVariants,
  addTileVariants,
} from '@web/components/actions/add-tile/add-tile.variants'
import { TwiseIcon } from '@web/components/icons/twise-icon'
import { cloneElement } from 'react'

export function AddTile({ title, text, link }: AddTileProps) {
  return cloneElement(
    link,
    { className: addTileVariants() },
    <>
      <TwiseIcon name="plus" />
      <span className={addTileTitleVariants()}>{title}</span>
      {text && <span className={addTileTextVariants()}>{text}</span>}
    </>,
  )
}
