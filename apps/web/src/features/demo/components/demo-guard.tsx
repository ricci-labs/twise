import { showToast } from '@web/components/feedback/toast'
import { demoMessages as messages } from '@web/features/demo/demo.messages'
import type { DemoGuardProps } from '@web/features/demo/demo.types'
import { useLightTheme } from '@web/hooks/use-light-theme'
import type { MouseEvent } from 'react'

const OPEN_PATHS = ['/demo', '/login', '/signup']

export function DemoGuard({ children }: DemoGuardProps) {
  useLightTheme()
  return (
    <div className="contents" onClickCapture={keepInsideDemo}>
      {children}
    </div>
  )
}

function keepInsideDemo(event: MouseEvent<HTMLDivElement>) {
  const link = event.target instanceof Element ? event.target.closest('a[href^="/"]') : null
  const path = link?.getAttribute('href') ?? ''
  if (!link || OPEN_PATHS.some((open) => path.startsWith(open))) {
    return
  }
  event.preventDefault()
  event.stopPropagation()
  if (link.getAttribute('aria-current') !== 'page') {
    showToast(messages.onlyHome)
  }
}
