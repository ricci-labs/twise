export type BeforeAfterItem = {
  label: string
  beforeCents: number
  afterCents: number
}

export type BeforeAfterTilesProps = {
  items: readonly BeforeAfterItem[]
  layout?: 'rows' | 'tiles'
}

export type BeforeAfterTileProps = {
  item: BeforeAfterItem
  layout: NonNullable<BeforeAfterTilesProps['layout']>
}
