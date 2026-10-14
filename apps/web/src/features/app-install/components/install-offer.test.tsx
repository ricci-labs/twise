import { InstallOffer } from '@web/features/app-install/components/install-offer'
import { listenForInstallOffer } from '@web/lib/install-prompt'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { finishInstall, offerInstall } from '@web/testing/install-offer'
import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { render } from 'vitest-browser-react'

const SNOOZED_AT_KEY = 'installOfferSnoozedAt'
const DAY_MS = 86_400_000

describe('InstallOffer', () => {
  beforeAll(() => {
    listenForInstallOffer()
  })

  afterEach(() => {
    finishInstall()
    localStorage.removeItem(SNOOZED_AT_KEY)
  })

  it('stays hidden when the browser offers no install', async () => {
    const screen = await render(<InstallOffer />)
    expect(screen.container.querySelector('[data-slot=install-offer]')).toBeNull()
  })

  it('offers the install and opens the browser dialog on "Instalar"', async () => {
    const { prompt } = offerInstall('accepted')
    const screen = await render(<InstallOffer />)

    await expect.element(page.getByRole('region', { name: 'Instale o Twise' })).toBeVisible()
    await expectNoAccessibilityViolations(screen.container)
    await page.getByRole('button', { name: 'Instalar' }).click()

    expect(prompt).toHaveBeenCalledOnce()
    await expect.element(page.getByText('Instale o Twise')).not.toBeInTheDocument()
  })

  it('waits 30 days after "Agora não" or a dismissed dialog', async () => {
    offerInstall('dismissed')
    await render(<InstallOffer />)
    await page.getByRole('button', { name: 'Agora não' }).click()

    await expect.element(page.getByText('Instale o Twise')).not.toBeInTheDocument()
    expect(Number(localStorage.getItem(SNOOZED_AT_KEY))).toBeGreaterThan(0)
  })

  it('stays hidden while snoozed and comes back after 30 days', async () => {
    offerInstall()
    localStorage.setItem(SNOOZED_AT_KEY, String(Date.now() - 29 * DAY_MS))
    const snoozed = await render(<InstallOffer />)
    expect(snoozed.container.querySelector('[data-slot=install-offer]')).toBeNull()
    await snoozed.unmount()

    localStorage.setItem(SNOOZED_AT_KEY, String(Date.now() - 31 * DAY_MS))
    await render(<InstallOffer />)
    await expect.element(page.getByText('Instale o Twise')).toBeVisible()
  })
})
