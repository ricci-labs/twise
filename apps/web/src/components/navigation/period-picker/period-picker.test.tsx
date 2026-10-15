import { type IsoDate, type Period, periodStartingIn } from '@financas/shared'
import { PeriodPicker } from '@web/components/navigation/period-picker/period-picker'
import type { PeriodPickerProps } from '@web/components/navigation/period-picker/period-picker.types'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import type { ComponentProps } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'
import { render } from 'vitest-browser-react'

function StepLink({ href, ...props }: ComponentProps<'a'>) {
  return <a href={href} {...props} />
}

const TODAY = '2026-10-20' as IsoDate

function periodsOf(year: number): Period[] {
  return Array.from({ length: 12 }, (_, index) =>
    periodStartingIn({ year, month: index + 1 }, { anchor: 'day_of_month', day: 5 }),
  )
}

function picker(overrides: Partial<PeriodPickerProps> = {}) {
  const sheet = {
    year: 2026,
    periods: periodsOf(2026),
    chosenLabel: '2026-10',
    currentLabel: '2026-10',
    onYearChange: vi.fn(),
    onPick: vi.fn(),
  }
  return {
    sheet,
    props: {
      title: 'out/26',
      detail: '5 out – 4 nov',
      previous: <StepLink href="#anterior" />,
      next: <StepLink href="#proximo" />,
      sheet,
      ...overrides,
    } satisfies PeriodPickerProps,
  }
}

describe('PeriodPicker', () => {
  afterEach(async () => {
    await page.viewport(414, 896)
  })

  it('steps with its arrows and opens the months of the year with their ranges', async () => {
    await page.viewport(390, 844)
    const { props, sheet } = picker()
    await render(<PeriodPicker {...props} />)

    await expect
      .element(page.getByRole('link', { name: 'Período anterior' }))
      .toHaveAttribute('href', '#anterior')
    await page.getByRole('button', { name: /out\/26/ }).click()
    const dialog = page.getByRole('dialog', { name: 'Escolher período' })
    await expect
      .element(dialog.getByRole('button', { name: /out\s*5 out – 4 nov/ }))
      .toHaveAttribute('aria-current', 'true')
    await expect.element(dialog.getByRole('button', { name: /dez\s*5 dez – 4 jan/ })).toBeVisible()
    await expect.element(dialog.getByText('Tracejados: períodos futuros.')).toBeVisible()
    await expectNoAccessibilityViolations(dialog.element())

    await dialog.getByRole('button', { name: 'Próximo ano' }).click()
    expect(sheet.onYearChange).toHaveBeenCalledWith(2027)
    await dialog.getByRole('button', { name: /ago\s*5 ago – 4 set/ }).click()
    expect(sheet.onPick).toHaveBeenCalledWith('2026-08')
    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument()
  })

  it('offers the other ranges and picks dates with the range calendar', async () => {
    await page.viewport(390, 844)
    const onPreset = vi.fn()
    const onRange = vi.fn()
    const { props } = picker({
      ranges: { today: TODAY, value: { from: null, to: null }, onPreset, onRange },
    })
    await render(<PeriodPicker {...props} />)

    await page.getByRole('button', { name: /out\/26/ }).click()
    await page.getByRole('button', { name: 'Últimos 30 dias' }).click()
    expect(onPreset).toHaveBeenCalledWith('last30Days')

    await page.getByRole('button', { name: /out\/26/ }).click()
    await page.getByRole('button', { name: 'Escolher datas' }).click()
    const dialog = page.getByRole('dialog', { name: 'Escolher datas' })
    await expect
      .element(dialog.getByRole('button', { name: 'Escolha o primeiro dia' }))
      .toHaveAttribute('aria-disabled', 'true')
    await dialog.getByRole('button', { name: '5 de outubro' }).click()
    await expect.element(dialog.getByRole('button', { name: 'Escolha o último dia' })).toBeVisible()
    await dialog.getByRole('button', { name: '20 de outubro' }).click()
    await dialog.getByRole('button', { name: 'Ver de 5 a 20 out' }).click()

    expect(onRange).toHaveBeenCalledWith({ from: '2026-10-05', to: '2026-10-20' })
    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument()
  })

  it('goes back from the dates to the months', async () => {
    const { props } = picker({
      ranges: {
        today: TODAY,
        value: { from: null, to: null },
        onPreset: vi.fn(),
        onRange: vi.fn(),
      },
    })
    await render(<PeriodPicker {...props} />)

    await page.getByRole('button', { name: /out\/26/ }).click()
    await page.getByRole('button', { name: 'Escolher datas' }).click()
    await page.getByRole('button', { name: 'Voltar' }).click()
    await expect.element(page.getByRole('dialog', { name: 'Escolher período' })).toBeVisible()
  })

  it('says when the periods could not be loaded and tries again', async () => {
    const onRetry = vi.fn()
    const { props, sheet } = picker()
    await render(
      <PeriodPicker {...props} sheet={{ ...sheet, periods: undefined, hasError: true, onRetry }} />,
    )

    await page.getByRole('button', { name: /out\/26/ }).click()
    await expect.element(page.getByText('Não foi possível carregar os períodos.')).toBeVisible()
    await page.getByRole('button', { name: 'Tentar de novo' }).click()
    expect(onRetry).toHaveBeenCalledOnce()
  })

  it('hides an arrow it was not given', async () => {
    const { props } = picker({ previous: undefined, next: undefined })
    await render(<PeriodPicker {...props} />)
    await expect.element(page.getByRole('link')).not.toBeInTheDocument()
  })
})
