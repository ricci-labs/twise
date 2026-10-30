import type { IsoDate } from '@financas/shared'
import type { ReactNode } from 'react'

export type MemberRowProps = {
  name: string
  email: string
  roleName: string
  joinedOn: IsoDate
  isYou?: boolean
  actions?: ReactNode
}
