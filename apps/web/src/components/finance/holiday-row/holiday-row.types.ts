import type { IsoDate } from '@financas/shared'
import type { ReactNode } from 'react'

export type HolidayStatus = 'past' | 'upcoming' | 'next'

export type HolidayRowProps = {
  onDate: IsoDate
  name: string
  status: HolidayStatus
  actions?: ReactNode
}
