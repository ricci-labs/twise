import type { sendOptionVariants } from '@web/components/finance/send-options/send-options.variants'
import type { VariantProps } from 'class-variance-authority'
import type { LucideIcon } from 'lucide-react'

export type SendByWhatsApp = {
  phone: string
  onSend: () => void
}

export type SendByEmail = {
  address: string
  isOptedOut?: boolean
  onSend: () => void
}

export type SendOptionsProps = {
  contactName: string
  message: string
  whatsapp?: SendByWhatsApp | null
  email?: SendByEmail | null
  onCopied?: () => void
  onCopyFailed?: () => void
  onAddChannel?: () => void
  className?: string
}

export type SendOptionProps = Pick<VariantProps<typeof sendOptionVariants>, 'kind'> & {
  icon: LucideIcon
  title: string
  detail: string
  onPress: () => void
  isDisabled?: boolean
}
