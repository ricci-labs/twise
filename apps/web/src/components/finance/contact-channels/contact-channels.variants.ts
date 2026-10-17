import { cva } from 'class-variance-authority'

export const contactChannelsVariants = cva(
  'flex flex-col rounded-xl border border-border bg-surface px-3',
)

export const contactChannelRowVariants = cva(
  'flex min-h-15 items-center gap-3 border-border py-2.5 not-first:border-t',
)

export const contactChannelIconVariants = cva(
  'grid size-9 shrink-0 place-items-center rounded-lg bg-sunken text-ink [&_svg]:size-4',
)

export const contactChannelTextVariants = cva('flex min-w-0 flex-1 flex-col gap-0.5')

export const contactChannelLabelVariants = cva('text-caption text-ink-muted')

export const contactChannelValueVariants = cva('break-words wrap-anywhere text-ink', {
  variants: {
    tone: {
      value: 'text-row font-semibold',
      missing: 'text-row text-ink-muted',
      note: 'text-body-sm',
    },
  },
  defaultVariants: { tone: 'value' },
})

export const contactChannelActionVariants = cva('shrink-0')
