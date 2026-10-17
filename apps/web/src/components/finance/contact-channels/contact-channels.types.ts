import type { contactChannelValueVariants } from '@web/components/finance/contact-channels/contact-channels.variants'
import type { VariantProps } from 'class-variance-authority'
import type { ReactNode } from 'react'

export type ContactChannelKind = 'whatsapp' | 'email' | 'pix' | 'notes'

export type ContactChannelsProps = {
  children: ReactNode
}

export type ContactChannelRowProps = VariantProps<typeof contactChannelValueVariants> & {
  kind: ContactChannelKind
  label: string
  value: string
  action?: ReactNode
}
