import { CHARGE_TAGS } from '@financas/shared'
import { TwiseIcon } from '@web/components/icons/twise-icon'
import { chargeTextEditorMessages as messages } from '@web/components/inputs/charge-text-editor/charge-text-editor.messages'
import type {
  ChargeTagButtonsProps,
  ChargeTextEditorProps,
  ChargeTextPart,
} from '@web/components/inputs/charge-text-editor/charge-text-editor.types'
import {
  chargeTagButtonsVariants,
  chargeTagButtonVariants,
  chargeTextAreaVariants,
  chargeTextBackdropVariants,
  chargeTextEditorVariants,
  chargeTextMarkVariants,
} from '@web/components/inputs/charge-text-editor/charge-text-editor.variants'
import { cn } from '@web/lib/cn'
import type { KeyboardEvent, MouseEvent } from 'react'

export function ChargeTextEditor({
  value,
  onChange,
  onKeyDown,
  isSingleLine = false,
  className,
  ...props
}: ChargeTextEditorProps) {
  const keyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (isSingleLine && event.key === ENTER) {
      event.preventDefault()
    }
    onKeyDown?.(event)
  }
  return (
    <div
      data-slot="charge-text-editor"
      data-invalid={props['aria-invalid'] ? '' : undefined}
      data-read-only={props.readOnly ? '' : undefined}
      className={cn(chargeTextEditorVariants(), className)}
    >
      <div aria-hidden="true" className={chargeTextBackdropVariants()}>
        {partsOf(value).map((part) =>
          part.tone ? (
            <mark
              key={part.key}
              data-slot="charge-text-tag"
              data-tone={part.tone}
              className={chargeTextMarkVariants({ tone: part.tone })}
            >
              {part.text}
            </mark>
          ) : (
            <span key={part.key}>{part.text}</span>
          ),
        )}
        {LAST_LINE_KEEPER}
      </div>
      <textarea
        data-slot="charge-text-area"
        rows={1}
        value={value}
        onChange={(event) =>
          onChange({
            target: { value: isSingleLine ? oneLine(event.target.value) : event.target.value },
          })
        }
        onKeyDown={keyDown}
        className={chargeTextAreaVariants()}
        {...props}
      />
    </div>
  )
}

export function ChargeTagButtons({
  onInsert,
  label = messages.tagButtons,
  className,
}: ChargeTagButtonsProps) {
  return (
    <fieldset
      aria-label={label}
      data-slot="charge-tag-buttons"
      className={cn(chargeTagButtonsVariants(), className)}
    >
      {CHARGE_TAGS.map((tag) => (
        <button
          key={tag}
          type="button"
          className={chargeTagButtonVariants()}
          onMouseDown={keepTheFieldFocused}
          onClick={() => onInsert(tag)}
        >
          <TwiseIcon name="plus" size="sm" />
          {messages.tags[tag]}
        </button>
      ))}
    </fieldset>
  )
}

function partsOf(value: string): ChargeTextPart[] {
  const parts: ChargeTextPart[] = []
  let cursor = 0
  for (const match of value.matchAll(TAG_PATTERN)) {
    if (match.index > cursor) {
      parts.push({ key: String(cursor), text: value.slice(cursor, match.index), tone: null })
    }
    const [tag] = match
    parts.push({ key: String(match.index), text: tag, tone: isKnownTag(tag) ? 'tag' : 'unknown' })
    cursor = match.index + tag.length
  }
  if (cursor < value.length) {
    parts.push({ key: String(cursor), text: value.slice(cursor), tone: null })
  }
  return parts
}

function isKnownTag(text: string): boolean {
  return (CHARGE_TAGS as readonly string[]).includes(text)
}

function oneLine(text: string): string {
  return text.replace(LINE_BREAKS, SPACE)
}

function keepTheFieldFocused(event: MouseEvent<HTMLButtonElement>) {
  event.preventDefault()
}

const TAG_PATTERN = /\{[^{}]*\}/g

const LINE_BREAKS = /\r?\n/g

const SPACE = ' '

const ENTER = 'Enter'

const LAST_LINE_KEEPER = ' '
