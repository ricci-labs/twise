import type {
  MessageBubbleProps,
  MessageLine,
} from '@web/components/finance/message-bubble/message-bubble.types'
import {
  messageBubbleLineVariants,
  messageBubblePixVariants,
  messageBubbleVariants,
} from '@web/components/finance/message-bubble/message-bubble.variants'
import { cn } from '@web/lib/cn'

export function MessageBubble({ message, pixPayload, className }: MessageBubbleProps) {
  return (
    <div data-slot="message-bubble" className={cn(messageBubbleVariants(), className)}>
      {linesOf(message, pixPayload).map((line) =>
        line.isPix ? (
          <p key={line.key} className={messageBubblePixVariants()}>
            {shortPix(line.text)}
          </p>
        ) : (
          <p key={line.key} className={messageBubbleLineVariants()}>
            {line.text}
          </p>
        ),
      )}
    </div>
  )
}

export function shortPix(payload: string): string {
  if (payload.length <= PIX_HEAD + PIX_TAIL) {
    return payload
  }
  return `${payload.slice(0, PIX_HEAD)}${ELLIPSIS}${payload.slice(-PIX_TAIL)}`
}

function linesOf(message: string, pixPayload: string | null | undefined): MessageLine[] {
  return message.split('\n').map((text, position) => ({
    key: `${position}:${text}`,
    text,
    isPix: Boolean(pixPayload) && text === pixPayload,
  }))
}

const PIX_HEAD = 36

const PIX_TAIL = 8

const ELLIPSIS = '…'
