export type EmailReplyTo = {
  name: string
  email: string
}

export type EmailSendSheetProps = {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  to: string
  subject: string
  replyTo: EmailReplyTo
  hasPix: boolean
  onPreview?: () => void
  onSend: () => void
  isSending?: boolean
}

export type EmailFactProps = {
  term: string
  children: string
}
