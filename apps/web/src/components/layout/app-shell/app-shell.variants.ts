import { cva } from 'class-variance-authority'

export const appShellVariants = cva('flex min-h-screen-safe bg-page')

export const appShellMainVariants = cva('flex min-w-0 flex-1 flex-col pb-28 lg:pb-0')

export const appShellFloatingVariants = cva('fixed right-4 bottom-27 z-sticky lg:hidden')
