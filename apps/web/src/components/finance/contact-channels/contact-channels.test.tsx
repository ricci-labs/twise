import {
  ContactChannelRow,
  ContactChannels,
} from '@web/components/finance/contact-channels/contact-channels'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { render } from 'vitest-browser-react'

const LONG_EMAIL = 'maria.aparecida.dos.santos.oliveira@exemplo.com'

describe('ContactChannels', () => {
  it('lists each channel with its label, value and action', async () => {
    const screen = await render(
      <ContactChannels>
        <ContactChannelRow
          kind="whatsapp"
          label="WhatsApp"
          value="+55 (11) 99999-0004"
          action={<a href="#whatsapp">Abrir</a>}
        />
        <ContactChannelRow kind="email" label="E-mail" value="Sem e-mail" tone="missing" />
      </ContactChannels>,
    )

    await expect.element(screen.getByText('+55 (11) 99999-0004')).toBeVisible()
    expect(screen.getByRole('listitem').elements()).toHaveLength(2)
    await expect.element(screen.getByRole('link', { name: 'Abrir' })).toBeVisible()
    await expect.element(screen.getByText('Sem e-mail')).toBeVisible()
    await expectNoAccessibilityViolations(screen.container)
  })

  it('wraps a long e-mail inside a 360 px phone instead of overflowing', async () => {
    await page.viewport(360, 800)
    const screen = await render(
      <div className="w-90">
        <ContactChannels>
          <ContactChannelRow kind="email" label="E-mail" value={LONG_EMAIL} />
        </ContactChannels>
      </div>,
    )
    const list = screen.container.querySelector('ul')

    await expect.element(screen.getByText(LONG_EMAIL)).toBeVisible()
    expect(list?.scrollWidth).toBe(list?.clientWidth)
  })
})
