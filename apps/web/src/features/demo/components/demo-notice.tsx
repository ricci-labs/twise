import type { DemoVariant } from '@financas/shared'
import { Link, useNavigate } from '@tanstack/react-router'
import { SegmentedControl } from '@web/components/actions/segmented-control'
import { TextLink } from '@web/components/actions/text-link'
import { Badge } from '@web/components/display/badge'
import { demoMessages as messages } from '@web/features/demo/demo.messages'
import type { DemoNoticeProps } from '@web/features/demo/demo.types'

export function DemoNotice({ variant }: DemoNoticeProps) {
  const navigate = useNavigate()
  return (
    <section
      aria-label={messages.label}
      className="mx-4 mt-3 flex flex-col gap-2.5 rounded-lg bg-sunken px-3.5 py-3 lg:mx-8 lg:mt-7 lg:flex-row lg:flex-wrap lg:items-center lg:gap-4"
    >
      <p className="flex flex-1 flex-wrap items-center gap-2 text-body-sm text-ink-muted">
        <Badge tone="info">{messages.label}</Badge>
        {messages.text}
        <TextLink render={<Link to="/signup" />}>{messages.signUp}</TextLink>
      </p>
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
    </section>
  )
}
