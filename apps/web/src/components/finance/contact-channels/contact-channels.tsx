import type {
  ContactChannelKind,
  ContactChannelRowProps,
  ContactChannelsProps,
} from '@web/components/finance/contact-channels/contact-channels.types'
import {
  contactChannelActionVariants,
  contactChannelIconVariants,
  contactChannelLabelVariants,
  contactChannelRowVariants,
  contactChannelsVariants,
  contactChannelTextVariants,
  contactChannelValueVariants,
} from '@web/components/finance/contact-channels/contact-channels.variants'
import { type LucideIcon, Mail, MessageCircle, NotebookText, QrCode } from 'lucide-react'

const CHANNEL_ICONS: Record<ContactChannelKind, LucideIcon> = {
  whatsapp: MessageCircle,
  email: Mail,
  pix: QrCode,
  notes: NotebookText,
}

export function ContactChannels({ children }: ContactChannelsProps) {
  return (
    <ul data-slot="contact-channels" className={contactChannelsVariants()}>
      {children}
    </ul>
  )
}

export function ContactChannelRow({ kind, label, value, tone, action }: ContactChannelRowProps) {
  const Icon = CHANNEL_ICONS[kind]
  return (
    <li data-slot="contact-channel-row" className={contactChannelRowVariants()}>
      <span className={contactChannelIconVariants()}>
        <Icon aria-hidden="true" />
      </span>
      <span className={contactChannelTextVariants()}>
        <span className={contactChannelLabelVariants()}>{label}</span>
        <span className={contactChannelValueVariants({ tone })}>{value}</span>
      </span>
      {action && <span className={contactChannelActionVariants()}>{action}</span>}
    </li>
  )
}
