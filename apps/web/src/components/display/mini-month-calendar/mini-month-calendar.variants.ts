import { cva } from 'class-variance-authority'

export const miniMonthVariants = cva(
  'flex h-full min-w-0 flex-col gap-2.5 rounded-lg border bg-surface px-4.5 pt-4 pb-4.5 text-ink',
  {
    variants: {
      isCurrent: {
        true: 'border-ink inset-ring-1 inset-ring-ink',
        false: 'border-border',
      },
    },
    defaultVariants: { isCurrent: false },
  },
)

export const miniMonthTitleVariants = cva('font-display text-tile-title', {
  variants: {
    isPast: {
      true: 'text-ink-muted',
      false: 'text-ink',
    },
  },
  defaultVariants: { isPast: false },
})

export const miniMonthGridVariants = cva('grid grid-cols-7 gap-y-0.5 text-center')

export const miniMonthWeekdayVariants = cva('py-0.75 text-badge-tiny font-semibold text-ink-subtle')

export const miniMonthCellVariants = cva('grid h-7 place-items-center')

export const miniMonthDayVariants = cva(
  'grid size-7 place-items-center rounded-full text-note tabular-nums',
  {
    variants: {
      mark: {
        plain: 'font-medium',
        weekend: 'font-medium',
        national: 'font-bold text-on-action-primary',
        workspace: 'font-bold text-on-mint',
      },
      isPast: { true: '', false: '' },
      isToday: {
        true: 'font-bold inset-ring-2 inset-ring-ink',
        false: '',
      },
      isNext: {
        true: 'ring-2 ring-warning-fill ring-offset-2 ring-offset-surface',
        false: '',
      },
    },
    compoundVariants: [
      { mark: 'plain', isPast: false, class: 'text-ink' },
      { mark: 'weekend', isPast: false, class: 'text-ink-muted' },
      { mark: ['plain', 'weekend'], isPast: true, class: 'text-ink-subtle' },
      { mark: 'national', isPast: false, class: 'bg-action-primary' },
      { mark: 'national', isPast: true, class: 'bg-ink-subtle' },
      { mark: 'workspace', isPast: false, class: 'bg-mint' },
      { mark: 'workspace', isPast: true, class: 'bg-mint/55' },
    ],
    defaultVariants: { mark: 'plain', isPast: false, isToday: false, isNext: false },
  },
)

export const miniMonthListVariants = cva(
  'mt-auto flex flex-col gap-1 border-t border-border pt-2.5',
)

export const miniMonthItemVariants = cva('flex min-w-0 items-baseline gap-2 text-note', {
  variants: {
    isPast: {
      true: 'text-ink-subtle',
      false: 'text-ink',
    },
  },
  defaultVariants: { isPast: false },
})

export const miniMonthItemDayVariants = cva('w-4.5 shrink-0 font-bold tabular-nums')

export const miniMonthItemNameVariants = cva('line-clamp-2 min-w-0 flex-1 break-words')

export const miniMonthItemTagVariants = cva('shrink-0 text-tag text-mint-ink')

export const miniMonthNoneVariants = cva('text-note text-ink-subtle')
