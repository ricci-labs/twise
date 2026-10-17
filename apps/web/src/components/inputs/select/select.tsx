import { PickerSheet } from '@web/components/inputs/picker-sheet'
import type { SelectProps } from '@web/components/inputs/select/select.types'
import { selectValueVariants, selectVariants } from '@web/components/inputs/select/select.variants'
import { cn } from '@web/lib/cn'
import { assignRef } from '@web/lib/refs'
import { ChevronDown } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'

export function Select({
  title,
  options,
  placeholder,
  value,
  onChange,
  onBlur,
  size,
  className,
  ref,
  ...props
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const button = useRef<HTMLButtonElement>(null)
  const keepButton = useCallback(
    (node: HTMLButtonElement | null) => {
      button.current = node
      assignRef(ref, node)
    },
    [ref],
  )
  const chosen = options.find((option) => option.value === value)
  return (
    <>
      <button
        type="button"
        data-slot="select"
        aria-haspopup="dialog"
        className={cn(selectVariants({ size }), className)}
        onClick={() => setIsOpen(true)}
        {...props}
        ref={keepButton}
      >
        <span className={selectValueVariants({ isEmpty: !chosen })}>
          {chosen ? (chosen.fieldLabel ?? chosen.label) : placeholder}
        </span>
        <ChevronDown aria-hidden="true" />
      </button>
      <PickerSheet
        title={title}
        items={options}
        value={value}
        layout="options"
        anchor={button}
        isOpen={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open)
          if (!open) {
            onBlur?.()
          }
        }}
        onSelect={(chosenValue) => onChange({ target: { value: chosenValue } })}
      />
    </>
  )
}
