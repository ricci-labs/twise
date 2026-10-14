import { Radio } from '@base-ui/react/radio'
import { RadioGroup } from '@base-ui/react/radio-group'
import { RichText } from '@web/components/display/rich-text'
import { TwiseIcon } from '@web/components/icons/twise-icon'
import { dayFieldMessages as messages } from '@web/components/inputs/day-field/day-field.messages'
import type { DayFieldProps, DaySheetProps } from '@web/components/inputs/day-field/day-field.types'
import {
  dayDotVariants,
  dayFieldVariants,
  dayGridVariants,
  dayNoteVariants,
  dayShortDotVariants,
  daySummaryVariants,
  dayVariants,
} from '@web/components/inputs/day-field/day-field.variants'
import { Sheet } from '@web/components/layout/sheet'
import { cn } from '@web/lib/cn'
import { assignRef } from '@web/lib/refs'
import { ChevronDown } from 'lucide-react'
import { useCallback, useState } from 'react'

const DAYS = Array.from({ length: 31 }, (_, index) => index + 1)

const FIRST_SHORT_DAY = 29

export function DayField({
  value,
  onChange,
  onBlur,
  title,
  summary,
  className,
  ref,
  ...props
}: DayFieldProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [button, setButton] = useState<HTMLButtonElement | null>(null)
  const keepButton = useCallback(
    (node: HTMLButtonElement | null) => {
      setButton(node)
      assignRef(ref, node)
    },
    [ref],
  )
  const day = value ? Number(value) : null
  return (
    <>
      <button
        type="button"
        data-slot="day-field"
        aria-haspopup="dialog"
        className={cn(dayFieldVariants(), className)}
        onClick={() => setIsOpen(true)}
        {...props}
        ref={keepButton}
      >
        <TwiseIcon name="calendar" size="sm" />
        <span className="flex-1">{day ? messages.day(day) : messages.placeholder}</span>
        <ChevronDown aria-hidden="true" />
      </button>
      <DaySheet
        anchor={button}
        title={title}
        value={day}
        summary={summary}
        isOpen={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open)
          if (!open) {
            onBlur?.()
          }
        }}
        onSelect={(chosen) => {
          onChange({ target: { value: String(chosen) } })
          setIsOpen(false)
        }}
      />
    </>
  )
}

function DaySheet({
  anchor,
  title,
  value,
  summary,
  isOpen,
  onOpenChange,
  onSelect,
}: DaySheetProps) {
  return (
    <Sheet
      title={title}
      closeLabel={messages.close}
      anchor={anchor}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    >
      <RadioGroup
        aria-label={title}
        value={value === null ? '' : String(value)}
        onValueChange={(next) => onSelect(Number(next))}
        className={dayGridVariants()}
      >
        {DAYS.map((day) => (
          <Radio.Root
            key={day}
            value={String(day)}
            nativeButton
            render={<button type="button" />}
            onClick={() => {
              if (day === value) {
                onSelect(day)
              }
            }}
            className={dayVariants()}
          >
            {day}
            {day >= FIRST_SHORT_DAY && (
              <span aria-hidden="true" className={dayShortDotVariants()} />
            )}
          </Radio.Root>
        ))}
      </RadioGroup>
      <p className={dayNoteVariants()}>
        <span aria-hidden="true" className={dayDotVariants()} />
        {messages.shortMonths}
      </p>
      {value && (
        <p className={daySummaryVariants()}>
          <TwiseIcon name="calendar" size="sm" />
          <span>
            <RichText text={summary(value)} />
          </span>
        </p>
      )}
    </Sheet>
  )
}
