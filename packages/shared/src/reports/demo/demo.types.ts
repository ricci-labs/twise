import type { FactAccount } from '@shared/reports/metrics/metrics.types'

export type DemoDirectory = {
  accounts: (FactAccount & { name: string })[]
  contacts: { id: string; name: string }[]
}
