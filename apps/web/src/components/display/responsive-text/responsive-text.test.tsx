import { ResponsiveText } from '@web/components/display/responsive-text/responsive-text'
import { afterEach, describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { render } from 'vitest-browser-react'

describe('ResponsiveText', () => {
  afterEach(async () => {
    await page.viewport(414, 896)
  })

  it('shows the short text on the phone and the long one from 1024 px', async () => {
    await page.viewport(390, 844)
    const screen = await render(<ResponsiveText short="Curto" long="Texto longo" />)

    await expect.element(screen.getByText('Curto')).toBeVisible()
    await expect.element(screen.getByText('Texto longo')).not.toBeVisible()

    await page.viewport(1440, 900)
    await expect.element(screen.getByText('Texto longo')).toBeVisible()
    await expect.element(screen.getByText('Curto')).not.toBeVisible()
  })
})
