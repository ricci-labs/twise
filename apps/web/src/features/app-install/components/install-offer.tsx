import { Button } from '@web/components/actions/button'
import { TwiseIcon } from '@web/components/icons/twise-icon'
import { appInstallMessages as messages } from '@web/features/app-install/app-install.messages'
import { isSnoozed, snooze } from '@web/features/app-install/components/install-snooze'
import { useCanInstall } from '@web/hooks/use-can-install'
import { install } from '@web/lib/install-prompt'
import { useId, useState } from 'react'

export function InstallOffer() {
  const canInstall = useCanInstall()
  const [isHidden, setIsHidden] = useState(() => isSnoozed(Date.now()))
  const titleId = useId()

  if (!canInstall || isHidden) {
    return null
  }

  const later = () => {
    snooze(Date.now())
    setIsHidden(true)
  }
  const accept = async () => {
    if ((await install()) === 'dismissed') {
      later()
    }
  }

  return (
    <section
      data-slot="install-offer"
      aria-labelledby={titleId}
      className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4"
    >
      <div className="flex items-center gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-mint-soft">
          <TwiseIcon name="install" tone="accent" size="side" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <h2 id={titleId} className="text-title-sm">
            {messages.title}
          </h2>
          <p className="text-note text-ink-muted">{messages.text}</p>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="quiet" size="sm" onClick={later}>
          {messages.later}
        </Button>
        <Button size="sm" onClick={() => void accept()}>
          {messages.install}
        </Button>
      </div>
    </section>
  )
}
