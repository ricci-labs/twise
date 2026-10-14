import type { IsoDate } from '@financas/shared'
import { CalendarSheet } from '@web/components/inputs/calendar-sheet/calendar-sheet'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { useState } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { render } from 'vitest-browser-react'

const TODAY = '2026-10-14' as IsoDate

function OtherDate() {
  const [isOpen, setIsOpen] = useState(false)
  const [value, setValue] = useState<IsoDate | null>(TODAY)
  const [button, setButton] = useState<HTMLButtonElement | null>(null)
  return (
    <>
      <button ref={setButton} type="button" onClick={() => setIsOpen(true)}>
        {value}
      </button>
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

function sheetBox() {
  return (document.querySelector('[data-slot=sheet]') as HTMLElement).getBoundingClientRect()
}

describe('CalendarSheet', () => {
  afterEach(async () => {
    await page.viewport(414, 896)
  })

  it('shows the month of the chosen day, starts on the right weekday and marks today', async () => {
    await page.viewport(390, 844)
    await render(<OtherDate />)
    await page.getByRole('button', { name: '2026-10-14' }).click()

    const dialog = page.getByRole('dialog', { name: 'Data' })
    await expect.element(dialog.getByText('Outubro de 2026')).toBeVisible()
    await expect
      .element(page.getByRole('radio', { name: '14 de outubro' }))
      .toHaveAttribute('data-today', '')
    await expect.element(page.getByRole('radio', { name: '14 de outubro' })).toBeChecked()
    const first = page.getByRole('radio', { name: '1 de outubro' }).element()
    const thursday = page.getByText('Q', { exact: true }).nth(1).element()
    expect(first.getBoundingClientRect().left).toBe(thursday.getBoundingClientRect().left)
    await expect.poll(() => Math.round(sheetBox().bottom)).toBe(844)
    await expectNoAccessibilityViolations(dialog.element())
  })

  it('moves between months and picks a day, closing', async () => {
    await page.viewport(390, 844)
    await render(<OtherDate />)
    await page.getByRole('button', { name: '2026-10-14' }).click()
    await page.getByRole('button', { name: 'Mês anterior' }).click()
    await expect.element(page.getByText('Setembro de 2026')).toBeVisible()
    await page.getByRole('radio', { name: '20 de setembro' }).click()

    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument()
    await expect.element(page.getByRole('button', { name: '2026-09-20' })).toBeVisible()
  })

  it('opens under its button on the desktop', async () => {
    await page.viewport(1440, 900)
    await render(<OtherDate />)
    const button = page.getByRole('button', { name: '2026-10-14' })
    await button.click()

    await expect.element(page.getByRole('dialog', { name: 'Data' })).toBeVisible()
    await expect
      .poll(() => sheetBox().top)
      .toBeGreaterThan(button.element().getBoundingClientRect().bottom)
  })
})
