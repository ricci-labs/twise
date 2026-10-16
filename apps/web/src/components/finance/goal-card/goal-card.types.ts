import type { ReactNode } from 'react'

export type GoalCardProps = {
  name: string
  art: { name: string; icon: string | null }
  accountName: string
  savedCents: number
  targetCents: number
  percent: number
  remainingCents: number
  overCents: number
  deadlineLabel: string | null
  monthlyToTargetCents: number | null
  actions?: ReactNode
}
