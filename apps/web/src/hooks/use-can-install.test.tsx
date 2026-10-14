import { useCanInstall } from '@web/hooks/use-can-install'
import { install, listenForInstallOffer } from '@web/lib/install-prompt'
import { finishInstall, offerInstall } from '@web/testing/install-offer'
import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'

function Installable() {
  return <output>{String(useCanInstall())}</output>
}

describe('useCanInstall', () => {
  beforeAll(() => {
    listenForInstallOffer()
  })

  afterEach(() => {
    finishInstall()
  })

  it('keeps the browser offer instead of letting the browser show its own banner', async () => {
    const screen = await render(<Installable />)
    await expect.element(screen.getByRole('status')).toHaveTextContent('false')

    const { event } = offerInstall()

    expect(event.defaultPrevented).toBe(true)
    await expect.element(screen.getByRole('status')).toHaveTextContent('true')
  })

  it('opens the install dialog once and says what the person chose', async () => {
    const screen = await render(<Installable />)
    const { prompt } = offerInstall('dismissed')

    expect(await install()).toBe('dismissed')
    expect(prompt).toHaveBeenCalledOnce()
    await expect.element(screen.getByRole('status')).toHaveTextContent('false')
    expect(await install()).toBe('dismissed')
    expect(prompt).toHaveBeenCalledOnce()
  })

  it('forgets the offer once the app is installed', async () => {
    const screen = await render(<Installable />)
    offerInstall()
    finishInstall()
    await expect.element(screen.getByRole('status')).toHaveTextContent('false')
  })
})
