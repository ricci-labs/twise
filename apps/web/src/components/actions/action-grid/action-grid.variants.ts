import { cva } from 'class-variance-authority'

export const actionGridFrameVariants = cva('@container')

export const actionGridVariants = cva(
  [
    'grid min-w-0 grid-cols-2 gap-2',
    '@action-row:grid-flow-col @action-row:grid-cols-none @action-row:auto-cols-fr',
    '*:w-full *:min-h-touch *:px-3',
  ],
  {
    variants: {
      layout: {
        primary: [
          '@max-action-row:[&>:first-child]:col-span-2',
          '@max-action-row:[&>:first-child]:min-h-control',
          '@max-action-row:[&>:last-child:nth-child(even)]:col-span-2',
        ],
        even: '@max-action-row:[&>:last-child:nth-child(odd)]:col-span-2',
      },
    },
    defaultVariants: { layout: 'primary' },
  },
)
