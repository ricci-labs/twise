import { TwiseIcon } from '@web/components/icons/twise-icon'
import { CalendarSheet } from '@web/components/inputs/calendar-sheet'
import { dateInputMessages as messages } from '@web/components/inputs/date-input/date-input.messages'
import type { DateInputProps } from '@web/components/inputs/date-input/date-input.types'
import {
  dateInputValueVariants,
  dateInputVariants,
} from '@web/components/inputs/date-input/date-input.variants'
import { cn } from '@web/lib/cn'
import { formatFullDate } from '@web/lib/format/calendar'
import { assignRef } from '@web/lib/refs'
import { ChevronDown } from 'lucide-react'
import { useCallback, useState } from 'react'

export function DateInput({
  value,
  onChange,
  onBlur,
  title,
  today,
  placeholder = messages.placeholder,
  className,
  ref,
  ...props
}: DateInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [button, setButton] = useState<HTMLButtonElement | null>(null)
  const keepButton = useCallback(
    (node: HTMLButtonElement | null) => {
      setButton(node)
      assignRef(ref, node)
    },
    [ref],
  )
  return (
    <>
      <button
        type="button"
        data-slot="date-input"
        aria-haspopup="dialog"
        className={cn(dateInputVariants(), className)}
        onClick={() => setIsOpen(true)}
        {...props}
        ref={keepButton}
      >
        <TwiseIcon name="calendar" size="sm" />
        <span className={dateInputValueVariants({ isEmpty: !value })}>
          {value ? formatFullDate(value) : placeholder}
        </span>
        <ChevronDown aria-hidden="true" />
      </button>
      <CalendarSheet
        title={title}
        value={value || null}
        today={today}
        anchor={button}
        isOpen={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open)
          if (!open) {
            onBlur?.()
          }
        }}
        onSelect={(date) => {
          onChange({ target: { value: date } })
          setIsOpen(false)
          onBlur?.()
        }}
      />
    </>
  )
}
