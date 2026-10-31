import { cva } from 'class-variance-authority'

export const permissionRowsVariants = cva(
  'flex flex-col rounded-lg border border-border bg-surface px-3 data-disabled:opacity-60',
)

export const permissionAreaVariants = cva(
  'm-0 min-w-0 border-0 border-border p-0 py-3 not-first:border-t',
)

export const permissionAreaTitleVariants = cva(
  'float-left mb-2 w-full p-0 text-label font-bold text-ink',
)

export const permissionGridVariants = cva('clear-left grid grid-cols-4 gap-2')

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

export const permissionMatrixVariants = cva(
  'w-full border-collapse text-left text-body-sm data-disabled:opacity-60',
)

export const permissionMatrixHeadVariants = cva('pb-2 font-normal text-ink-muted', {
  variants: { align: { start: 'text-left', center: 'w-24 text-center' } },
  defaultVariants: { align: 'start' },
})

export const permissionMatrixRowVariants = cva('border-t border-border')

export const permissionMatrixAreaVariants = cva('py-3 pr-4 font-semibold text-ink')

export const permissionMatrixCellVariants = cva('py-2 text-center text-ink-muted')

export const permissionCheckboxBoxVariants = cva('relative inline-grid size-6 place-items-center')

export const permissionCheckboxVariants = cva([
  'size-6 cursor-pointer appearance-none rounded-sm border border-border-control bg-surface outline-none',
  'focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2',
  'checked:border-ink checked:bg-ink',
  'disabled:cursor-not-allowed disabled:bg-sunken',
])

export const permissionCheckboxMarkVariants = cva(
  'pointer-events-none absolute size-4 text-ink-muted',
  {
    variants: { isChecked: { true: 'text-on-action-primary', false: 'hidden' } },
  },
)
