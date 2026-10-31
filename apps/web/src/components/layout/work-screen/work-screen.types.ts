import type { ReactNode } from 'react'

export type WorkScreenProps = {
  listLabel: string
  listHeader?: ReactNode
  list: ReactNode
  detailLabel: string
  detailHeader?: ReactNode
  detail: ReactNode
  onNearEnd?: () => void
}
