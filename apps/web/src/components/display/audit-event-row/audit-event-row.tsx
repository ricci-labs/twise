import { auditEventRowMessages as messages } from '@web/components/display/audit-event-row/audit-event-row.messages'
import type {
  AuditActorMarkProps,
  AuditEventRowProps,
  AuditSentenceProps,
} from '@web/components/display/audit-event-row/audit-event-row.types'
import {
  auditEventRowBadgeVariants,
  auditEventRowChevronVariants,
  auditEventRowDetailVariants,
  auditEventRowMainVariants,
  auditEventRowSentenceVariants,
  auditEventRowSystemVariants,
  auditEventRowTextVariants,
  auditEventRowVariants,
} from '@web/components/display/audit-event-row/audit-event-row.variants'
import { Avatar } from '@web/components/display/avatar'
import { MetaLine } from '@web/components/display/meta-line'
import { ChevronRight, MessageCircle, Zap } from 'lucide-react'
import { cloneElement } from 'react'

export function AuditEventRow({
  actorName,
  sentence,
  detail,
  isWhatsApp = false,
  isSelected = false,
  link,
}: AuditEventRowProps) {
  const className = auditEventRowMainVariants()
  const content = (
    <>
      <AuditActorMark actorName={actorName} />
      <span className={auditEventRowTextVariants()}>
        <AuditSentence sentence={sentence} />
        <span className={auditEventRowDetailVariants()}>
          {isWhatsApp && (
            <span className={auditEventRowBadgeVariants()}>
              <MessageCircle aria-hidden="true" />
              {messages.whatsApp}
            </span>
          )}
          <MetaLine text={detail} />
        </span>
      </span>
      {link && <ChevronRight aria-hidden="true" className={auditEventRowChevronVariants()} />}
    </>
  )
  return (
    <li data-slot="audit-event-row" className={auditEventRowVariants()}>
      {link ? (
        cloneElement(link, { className, 'aria-current': isSelected ? 'true' : undefined }, content)
      ) : (
        <div className={className}>{content}</div>
      )}
    </li>
  )
}

export function AuditActorMark({ actorName }: AuditActorMarkProps) {
  if (actorName === null) {
    return (
      <span aria-hidden="true" className={auditEventRowSystemVariants()}>
        <Zap />
      </span>
    )
  }
  return <Avatar name={actorName} />
}

function AuditSentence({ sentence }: AuditSentenceProps) {
  return (
    <span className={auditEventRowSentenceVariants()}>
      {withOffsets(sentence).map(({ part, offset }) =>
        part.isStrong ? <strong key={offset}>{part.text}</strong> : part.text,
      )}
    </span>
  )
}

function withOffsets(sentence: AuditSentenceProps['sentence']) {
  let offset = 0
  return sentence.map((part) => {
    const placed = { part, offset }
    offset += part.text.length
    return placed
  })
}
