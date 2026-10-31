import type { ReactElement, ReactNode } from 'react'

export type AuditSentencePart = {
  text: string
  isStrong?: boolean
}

export type AuditEventRowLinkProps = {
  className?: string
  'aria-current'?: 'true'
  children?: ReactNode
}

export type AuditEventRowProps = {
  actorName: string | null
  sentence: readonly AuditSentencePart[]
  detail: string
  isWhatsApp?: boolean
  isSelected?: boolean
  link?: ReactElement<AuditEventRowLinkProps>
}

export type AuditActorMarkProps = Pick<AuditEventRowProps, 'actorName'>

export type AuditSentenceProps = Pick<AuditEventRowProps, 'sentence'>
