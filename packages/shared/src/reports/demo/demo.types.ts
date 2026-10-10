import type { FactAccount } from '@shared/reports/metrics/metrics.types'

export type DemoDirectory = {
  accounts: (FactAccount & { name: string; icon: string | null })[]
  contacts: { id: string; name: string }[]
}
