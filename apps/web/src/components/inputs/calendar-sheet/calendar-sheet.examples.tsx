import type { IsoDate } from '@financas/shared'
import { Button } from '@web/components/actions/button'
import { CalendarSheet } from '@web/components/inputs/calendar-sheet/calendar-sheet'
import type { ComponentExamples } from '@web/lib/examples.types'
import { useState } from 'react'

const TODAY = '2026-10-14' as IsoDate

function OtherDate() {
  const [isOpen, setIsOpen] = useState(false)
  const [value, setValue] = useState<IsoDate | null>(null)
  const [button, setButton] = useState<HTMLButtonElement | null>(null)
  return (
    <>
      <Button ref={setButton} variant="outline" onClick={() => setIsOpen(true)}>
        {value ?? 'Outra data'}
      </Button>
      <CalendarSheet
        title="Data"
        value={value}
        today={TODAY}
        anchor={button}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        onSelect={(date) => {
          setValue(date)
          setIsOpen(false)
        }}
      />
    </>
  )
}

export const calendarSheetExamples: ComponentExamples = {
  component: 'CalendarSheet',
  examples: [{ name: 'Outra data', render: () => <OtherDate /> }],
}
