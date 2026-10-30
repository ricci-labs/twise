import type { ReactNode } from 'react'

export type RoleCardProps = {
  name: string
  description: string
  isSystem: boolean
  isLocked?: boolean
  memberCount: number
  invitationCount: number
  actions?: ReactNode
}
