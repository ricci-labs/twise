import { Banner } from '@web/components/feedback/banner'
import type { OfflineBannerProps } from '@web/components/feedback/offline-banner/offline-banner.types'
import { useIsOnline } from '@web/hooks/use-is-online'
import { NETWORK_ERROR_MESSAGE } from '@web/lib/errors/errors.messages'
import { WifiOff } from 'lucide-react'

export function OfflineBanner({ message = NETWORK_ERROR_MESSAGE, aside }: OfflineBannerProps) {
  const isOnline = useIsOnline()
  if (isOnline) {
    return null
  }
  return (
    <Banner icon={WifiOff} action={aside}>
      {message}
    </Banner>
  )
}
