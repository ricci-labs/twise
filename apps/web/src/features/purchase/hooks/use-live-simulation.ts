import { useQuery } from '@tanstack/react-query'
import { purchaseSimulationQueryOptions } from '@web/features/purchase/api/purchase.queries'
import { simulationKeyOf } from '@web/features/purchase/components/purchase-views'
import type { LiveSimulation, SimulationQuery } from '@web/features/purchase/purchase.types'
import { useEffect, useState } from 'react'

const SETTLE_MS = 500
const NO_QUERY = { amountCents: '0', installmentCount: '1' }

export function useLiveSimulation(
  workspaceId: string,
  query: SimulationQuery | null,
): LiveSimulation {
  const key = simulationKeyOf(query)
  const [settled, setSettled] = useState(query)
  useEffect(() => {
    const timer = setTimeout(() => setSettled(JSON.parse(key) as SimulationQuery | null), SETTLE_MS)
    return () => clearTimeout(timer)
  }, [key])
  const result = useQuery({
    ...purchaseSimulationQueryOptions(workspaceId, settled ?? NO_QUERY),
    enabled: settled !== null,
  })
  return { query: settled, isWaiting: key !== simulationKeyOf(settled), result }
}
