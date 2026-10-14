import { canInstall, subscribeToInstallOffer } from '@web/lib/install-prompt'
import { useSyncExternalStore } from 'react'

export function useCanInstall(): boolean {
  return useSyncExternalStore(subscribeToInstallOffer, canInstall)
}
