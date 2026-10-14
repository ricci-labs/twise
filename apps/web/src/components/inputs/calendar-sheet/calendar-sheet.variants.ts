import { cva } from 'class-variance-authority'

export const calendarHeadVariants = cva('flex items-center justify-between gap-2 px-1')

export const calendarMonthVariants = cva('text-title-sm text-ink')

export const calendarStepVariants = cva(
  'grid size-touch cursor-pointer place-items-center rounded-full text-ink outline-none hover:bg-sunken focus-visible:ring-2 focus-visible:ring-focus-ring [&_svg]:size-5',
)

export const calendarGridVariants = cva(
  'grid grid-cols-7 justify-items-center gap-x-1 gap-y-1.5 px-1 pb-1',
)

export const calendarWeekdayVariants = cva(
  'grid h-6 w-10.5 place-items-center text-note text-ink-muted',
)

export const calendarDayVariants = cva(
  [
    'relative grid size-10.5 cursor-pointer place-items-center rounded-full text-body leading-none font-medium text-ink tabular-nums outline-none',
    'hover:bg-sunken focus-visible:ring-2 focus-visible:ring-focus-ring',
    'data-today:font-emphasis data-today:not-data-checked:text-mint-ink',
    'data-checked:bg-surface data-checked:font-heavy data-checked:text-ink data-checked:inset-ring-2 data-checked:inset-ring-ink',
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
    },
    defaultVariants: { startsOn: 'none' },
  },
)

export const calendarTodayDotVariants = cva(
  'absolute bottom-1.25 left-1/2 -ml-0.5 size-1 rounded-full bg-mint-ink',
)
