import { SegmentedControl } from '@web/components/actions/segmented-control'
import { Card } from '@web/components/display/card'
import { ChargeEmailPreview } from '@web/components/finance/charge-email-preview'
import { InboxPreview } from '@web/components/finance/inbox-preview'
import { MessageBubble } from '@web/components/finance/message-bubble'
import { settingsMessages } from '@web/features/settings/settings.messages'
import type {
  ChargeTextPreviewProps,
  ChargeTextPreviewTab,
} from '@web/features/settings/settings.types'
import { useState } from 'react'

const messages = settingsMessages.chargeText
const TABS = [
  { value: 'email', label: messages.previewEmail },
  { value: 'whatsapp', label: messages.previewWhatsApp },
] as const

export function ChargeTextPhonePreview({ previews }: ChargeTextPreviewProps) {
  const [tab, setTab] = useState<ChargeTextPreviewTab>('email')
  return (
    <section
      aria-label={messages.previewTitle}
      className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-3.5"
    >
      <h2 className="font-semibold text-label text-ink-muted">{messages.previewTitle}</h2>
      <SegmentedControl
        label={messages.previewTabs}
        width="full"
        options={TABS}
        value={tab}
        onValueChange={(value) => setTab(value as ChargeTextPreviewTab)}
      />
      {tab === 'email' ? (
        <InboxPreview
          sender={previews.sender}
          subject={previews.subject}
          preheader={previews.preheader}
        />
      ) : (
        <MessageBubble message={previews.whatsApp} pixPayload={previews.pixPayload} />
      )}
    </section>
  )
}

export function ChargeTextWhatsAppPreview({ previews }: ChargeTextPreviewProps) {
  return (
    <section
      aria-label={messages.whatsAppTitle}
      className="flex flex-col gap-3 border-t border-border pt-5"
    >
      <h2 className="font-semibold text-label text-ink-muted">{messages.whatsAppTitle}</h2>
      <MessageBubble message={previews.whatsApp} pixPayload={previews.pixPayload} />
    </section>
  )
}

export function ChargeTextDesktopPreviews({ previews }: ChargeTextPreviewProps) {
  return (
    <Card title={messages.emailTitle} description={messages.emailLead(previews.email.contactName)}>
      <div className="flex flex-col gap-4">
        <InboxPreview
          sender={previews.sender}
          subject={previews.subject}
          preheader={previews.preheader}
        />
        <ChargeEmailPreview {...previews.email} />
      </div>
    </Card>
  )
}
