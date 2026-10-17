import { InboxPreview } from '@web/components/finance/inbox-preview/inbox-preview'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'

const SUBJECT = 'Member A te enviou uma cobrança de R$ 200,00'
const PREHEADER =
  'Oi, Member D! Member A pediu para te lembrar do que está em aberto. Dá para pagar com Pix, o valor já vem preenchido.'

describe('InboxPreview', () => {
  it('shows the sender, the time, the subject and the preheader', async () => {
    const screen = await render(
      <InboxPreview sender="Twise · Casa" subject={SUBJECT} preheader={PREHEADER} />,
    )

    await expect.element(screen.getByText('Twise · Casa')).toBeVisible()
    await expect.element(screen.getByText('agora')).toBeVisible()
    await expect.element(screen.getByText(SUBJECT)).toBeVisible()
    await expect.element(screen.getByText(PREHEADER)).toBeVisible()
    await expectNoAccessibilityViolations(screen.container)
  })

  it('keeps the subject and the preheader on one line each, as an inbox does', async () => {
    const screen = await render(
      <div className="w-80">
        <InboxPreview sender="Twise · Casa" subject={SUBJECT} preheader={PREHEADER} time="09:41" />
      </div>,
    )

    for (const text of [SUBJECT, PREHEADER]) {
      const line = screen.getByText(text).element() as HTMLElement
      expect(line.scrollWidth).toBeGreaterThan(line.clientWidth)
      expect(line.getClientRects()).toHaveLength(1)
    }
    await expect.element(screen.getByText('09:41')).toBeVisible()
  })
})
