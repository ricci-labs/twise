import type { ComponentProps, ReactElement } from 'react'

export type AllocationStepArt = {
  name: string
  icon: string | null
}

export type AllocationStepGripProps = Omit<ComponentProps<'button'>, 'children' | 'type'>

export type AllocationStepRowProps = Omit<ComponentProps<'li'>, 'children' | 'title'> & {
  position: number
  title: string
  detail?: string
  art: AllocationStepArt
  isLifted?: boolean
  isInvalid?: boolean
  isReadOnly?: boolean
  invalidMessage?: string
  gripProps?: AllocationStepGripProps
  actions?: ReactElement
}
