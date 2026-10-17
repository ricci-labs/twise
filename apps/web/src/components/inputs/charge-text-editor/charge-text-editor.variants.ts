import { cva } from 'class-variance-authority'

export const chargeTextEditorVariants = cva([
  'grid min-h-control w-full rounded-md border border-border-control bg-surface text-body text-ink',
  'focus-within:border-ink focus-within:ring-1 focus-within:ring-ink',
  'data-invalid:border-danger data-invalid:ring-1 data-invalid:ring-danger',
  'data-read-only:border-border data-read-only:bg-sunken data-read-only:text-ink-muted',
])

const LAYER = 'col-start-1 row-start-1 m-0 px-4 py-2.5 whitespace-pre-wrap wrap-break-word'

export const chargeTextBackdropVariants = cva([
  LAYER,
  'pointer-events-none text-transparent select-none',
])

export const chargeTextAreaVariants = cva([
  LAYER,
  'resize-none overflow-hidden border-0 bg-transparent outline-none placeholder:text-ink-subtle',
])

export const chargeTextMarkVariants = cva('rounded-swatch text-transparent', {
  variants: {
    tone: {
      tag: 'bg-mint-soft ring-2 ring-mint-soft outline-1 outline-offset-2 outline-mint',
      unknown:
        'bg-danger-soft ring-2 ring-danger-soft underline decoration-danger decoration-wavy underline-offset-4',
    },
  },
  defaultVariants: { tone: 'tag' },
})

export const chargeTagButtonsVariants = cva('m-0 flex min-w-0 flex-wrap gap-2 border-0 p-0')

export const chargeTagButtonVariants = cva([
  'inline-flex min-h-control-sm cursor-pointer items-center gap-1 rounded-full border border-dashed border-border-control bg-surface px-3 text-chip font-emphasis whitespace-nowrap text-ink outline-none select-none',
  'hover:bg-sunken focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2',
  '[&_svg]:size-3.5',
])
