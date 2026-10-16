import type { ReactNode } from 'react'

export type ReserveFigures = {
  savedCents: number
  targetCents: number
  accountName: string
  percent: number
  remainingCents: number
  overCents: number
  coverageMonths: number | null
}

export type ReserveCardProps = {
  reserve: ReserveFigures | null
  actions?: ReactNode
  createAction?: ReactNode
}
