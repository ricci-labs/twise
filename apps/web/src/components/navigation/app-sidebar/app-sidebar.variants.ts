import { cva } from 'class-variance-authority'

export const appSidebarVariants = cva(
  'group/sidebar sticky top-0 flex h-dvh shrink-0 flex-col gap-0.5 overflow-y-auto border-r border-border bg-surface py-5 transition-all duration-collapse ease-out',
  {
    variants: {
      isCollapsed: {
        false: 'w-66 px-4',
        true: 'w-19 items-center px-2',
      },
    },
    defaultVariants: { isCollapsed: false },
  },
)

export const sidebarHeadVariants = cva('flex items-center pb-3', {
  variants: {
    isCollapsed: {
      false: 'justify-between px-2',
      true: 'flex-col gap-3',
    },
  },
  defaultVariants: { isCollapsed: false },
})

export const sidebarToggleVariants = cva(
  'grid size-8 cursor-pointer place-items-center rounded-md text-ink-subtle hover:bg-sunken hover:text-ink focus-visible:ring-2 focus-visible:ring-focus-ring',
)

export const sidebarGroupVariants = cva(
  'mx-3 mt-4 mb-1.5 text-caption font-semibold tracking-wide text-ink-subtle uppercase',
)

export const sidebarDividerVariants = cva('my-3 h-px w-8 self-center bg-border')

export const sidebarFootVariants = cva(
  'mt-auto flex flex-col gap-1.5 border-t border-border pt-3.5',
)

export const sidebarTooltipVariants = cva(
  'z-overlay rounded-md bg-ink px-2.5 py-1.5 text-body-sm text-surface shadow-float',
)

export const sidebarLabelVariants = cva(
  'transition-opacity duration-fast ease-out group-data-fading/sidebar:opacity-0',
)
