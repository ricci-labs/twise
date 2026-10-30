import { cva } from 'class-variance-authority'

export const permissionRowsVariants = cva(
  'flex flex-col rounded-lg border border-border bg-surface px-3 data-disabled:opacity-60',
)

export const permissionAreaVariants = cva(
  'flex flex-col gap-2 border-border py-3 not-first:border-t',
)

export const permissionAreaTitleVariants = cva('text-label font-semibold text-ink')

export const permissionGridVariants = cva('grid grid-cols-4 gap-2')

export const permissionToggleVariants = cva(
  [
    'inline-flex min-h-9 cursor-pointer items-center justify-center gap-1 rounded-full border border-border-control bg-surface px-2 text-label text-ink outline-none',
    'hover:bg-sunken focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 [&_svg]:size-3.5',
    'aria-pressed:border-ink aria-pressed:font-emphasis aria-pressed:ring-1 aria-pressed:ring-ink aria-pressed:ring-inset',
    'disabled:cursor-not-allowed disabled:bg-sunken disabled:text-ink-muted disabled:hover:bg-sunken',
  ],
  {
    variants: {
      column: {
        view: 'col-start-1',
        create: 'col-start-2',
        update: 'col-start-3',
        delete: 'col-start-4',
      },
    },
  },
)
