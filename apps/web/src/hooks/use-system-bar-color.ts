import { requestSystemBarColor } from '@web/lib/system-bar'
import type { SystemBarColor } from '@web/lib/system-bar.types'
import { useLayoutEffect } from 'react'

export function useSystemBarColor(color: SystemBarColor, isActive = true) {
  useLayoutEffect(() => {
    if (!isActive) {
      return
    }
    return requestSystemBarColor(color)
  }, [color, isActive])
}
