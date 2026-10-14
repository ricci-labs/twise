import { cva } from 'class-variance-authority'

export const addTileVariants = cva([
  'flex h-full min-h-60 flex-col items-center justify-center gap-1.5 rounded-xl border-stroke border-dashed border-border-control p-4 text-center text-ink outline-none',
  'hover:bg-sunken focus-visible:ring-2 focus-visible:ring-focus-ring [&>svg]:size-5',
])

export const addTileTitleVariants = cva('font-display text-tile-title')

export const addTileTextVariants = cva('max-w-55 text-sub-page text-ink-muted')
