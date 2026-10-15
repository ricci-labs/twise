import { cva } from 'class-variance-authority'

export const calendarMonthVariants = cva('flex flex-col gap-1')

export const calendarHeadVariants = cva('flex items-center justify-between gap-2 px-1')

export const calendarTitleVariants = cva('text-title-sm text-ink')

export const calendarStepVariants = cva(
  'grid size-touch cursor-pointer place-items-center rounded-full text-ink outline-none hover:bg-sunken focus-visible:ring-2 focus-visible:ring-focus-ring [&_svg]:size-5',
)

export const calendarGridVariants = cva('grid grid-cols-7 justify-items-center pb-1', {
  variants: {
    mode: {
      single: 'gap-x-1 gap-y-1.5 px-1',
      range: 'm-0 min-w-0 gap-y-1 border-0 p-0',
    },
  },
  defaultVariants: { mode: 'single' },
})

export const calendarWeekdayVariants = cva(
  'grid h-6 w-10.5 place-items-center text-note text-ink-muted',
)

export const calendarDayVariants = cva(
  [
    'relative grid size-10.5 cursor-pointer place-items-center rounded-full text-body leading-none font-medium text-ink tabular-nums outline-none',
    'hover:bg-sunken focus-visible:ring-2 focus-visible:ring-focus-ring',
    'data-today:font-emphasis',
    'data-chosen:bg-surface data-chosen:font-heavy data-chosen:text-ink data-chosen:inset-ring-2 data-chosen:inset-ring-ink',
  ],
  {
    variants: {
      startsOn: {
        none: '',
        sunday: 'col-start-1',
        monday: 'col-start-2',
        tuesday: 'col-start-3',
        wednesday: 'col-start-4',
        thursday: 'col-start-5',
        friday: 'col-start-6',
        saturday: 'col-start-7',
      },
      shape: {
        round: 'data-today:not-data-chosen:text-mint-ink',
        box: 'rounded-sm',
      },
    },
    defaultVariants: { startsOn: 'none', shape: 'round' },
  },
)

export const calendarRangeCellVariants = cva('grid w-full place-items-center', {
  variants: {
    isInRange: { true: 'bg-sunken', false: '' },
  },
  defaultVariants: { isInRange: false },
})

export const calendarTodayDotVariants = cva(
  'absolute bottom-1.25 left-1/2 -ml-0.5 size-1 rounded-full bg-mint-ink',
)
