import type { DemoVariant } from '@financas/shared'
import { Link, useNavigate } from '@tanstack/react-router'
import { Button } from '@web/components/actions/button'
import { SegmentedControl } from '@web/components/actions/segmented-control'
import { Logo } from '@web/components/brand/logo'
import { Badge } from '@web/components/display/badge'
import { showToast } from '@web/components/feedback/toast'
import { demoMessages as messages } from '@web/features/demo/demo.messages'
import type { DemoFrameProps } from '@web/features/demo/demo.types'
import { useLightTheme } from '@web/hooks/use-light-theme'
import type { MouseEvent } from 'react'

const APP_LINK = 'a[href^="/w/"]'

export function DemoFrame({ variant, children }: DemoFrameProps) {
  useLightTheme()
  const navigate = useNavigate()

  function keepInsideDemo(event: MouseEvent<HTMLDivElement>) {
    if (event.target instanceof Element && event.target.closest(APP_LINK)) {
      event.preventDefault()
      showToast(messages.onlyHome)
    }
  }

  return (
    <div className="min-h-dvh bg-page">
      <section
        aria-label={messages.label}
        className="sticky top-0 z-sticky flex flex-wrap items-center gap-3 border-b border-border bg-surface px-4 py-3 lg:px-8"
      >
        <Logo />
        <Badge tone="info">{messages.label}</Badge>
        <p className="hidden flex-1 text-body-sm text-ink-muted lg:block">{messages.text}</p>
        <SegmentedControl
          label={messages.situation}
          value={variant}
          onValueChange={(next) =>
            void navigate({
              to: '/demo',
              search: (previous) => ({
                ...previous,
                variant: next === 'overspent' ? 'overspent' : undefined,
              }),
            })
          }
          options={[
            { value: 'normal' satisfies DemoVariant, label: messages.normal },
            { value: 'overspent' satisfies DemoVariant, label: messages.overspent },
          ]}
        />
        <Button variant="outline" size="sm" render={<Link to="/login" />}>
          {messages.logIn}
        </Button>
      </section>
      <p className="px-4 pt-3 text-body-sm text-ink-muted lg:hidden">{messages.text}</p>
      <main onClickCapture={keepInsideDemo}>{children}</main>
    </div>
  )
}
