import type { Env } from '@api/core/config/env.schemas'

export type MailerEnv = Pick<
  Env,
  | 'SMTP_HOST'
  | 'SMTP_PORT'
  | 'SMTP_SECURE'
  | 'SMTP_USER'
  | 'SMTP_PASSWORD'
  | 'EMAIL_FROM'
  | 'EMAIL_FROM_NAME'
  | 'EMAIL_OUTBOX_DIR'
>

export type InlineImage = {
  cid: string
  filename: string
  contentType: string
  base64: string
}

export type EmailMessage = {
  template: string
  to: string
  subject: string
  text: string
  html: string
  fromName?: string
  replyTo?: string
  inlineImages?: readonly InlineImage[]
}

export type SentEmail = {
  messageId: string
}

export type Mailer = {
  send: (message: EmailMessage) => Promise<SentEmail>
}

export type EmailLink = { label: string; url: string }

export type EmailSpan = string | { strong: string } | { link: EmailLink }

export type EmailParagraph = string | readonly EmailSpan[]

export type EmailIllustration =
  | 'envelope'
  | 'welcome'
  | 'key'
  | 'padlock'
  | 'invitation'
  | 'together'

export type EmailItemRow = {
  label: string
  detail: string
  amount: string
}

export type EmailBlock =
  | { kind: 'items'; rows: readonly EmailItemRow[]; total: { label: string; amount: string } }
  | { kind: 'due'; text: string; isPast: boolean }
  | { kind: 'pix'; qrCid: string; title: string; text: EmailParagraph }
  | { kind: 'code'; label: string; code: string }

type EmailBody = {
  preheader?: string
  greeting?: string
  illustration?: EmailIllustration
  heading: string
  paragraphs: EmailParagraph[]
  blocks?: readonly EmailBlock[]
  closing?: EmailParagraph
  notes: EmailParagraph[]
  reason?: string
  footerLink?: EmailLink
}

export type EmailContent = EmailBody &
  ({ action: EmailLink; baseUrl?: string } | { action?: undefined; baseUrl: string })

export type RenderedEmail = {
  text: string
  html: string
}

export type Deliver = (message: EmailMessage) => Promise<SentEmail>
