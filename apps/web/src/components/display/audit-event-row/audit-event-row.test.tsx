import { AuditEventRow } from '@web/components/display/audit-event-row/audit-event-row'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { render } from 'vitest-browser-react'

const SENTENCE = [
  { text: 'Member B', isStrong: true },
  { text: ' editou o lançamento ' },
  { text: 'Padaria', isStrong: true },
  { text: ': valor de R$ 18,50 para R$ 21,00' },
]

describe('AuditEventRow', () => {
  it('shows who, the sentence with the item in bold, the support line and a link', async () => {
    const screen = await render(
      <ul>
        <AuditEventRow
          actorName="Member B"
          sentence={SENTENCE}
          detail="11:05 · Lançamentos · Ref. a91b2f07"
          link={<a href="#evento" />}
        />
      </ul>,
    )

    const link = screen.getByRole('link')
    await expect
      .element(link)
      .toHaveAccessibleName(
        'Member B editou o lançamento Padaria: valor de R$ 18,50 para R$ 21,00 11:05 · Lançamentos · Ref. a91b2f07',
      )
    await expect.element(screen.getByText('Padaria')).toHaveProperty('tagName', 'STRONG')
    expect(screen.container.querySelector('[data-slot=avatar]')?.textContent).toBe('M')
    expect(link.element().getAttribute('aria-current')).toBeNull()
    await expectNoAccessibilityViolations(screen.container)
  })

  it('marks the automatic events with the bolt, the WhatsApp ones with a badge first', async () => {
    const screen = await render(
      <ul>
        <AuditEventRow
          actorName={null}
          sentence={[{ text: 'Automático', isStrong: true }, { text: ' criou o previsto' }]}
          detail="06:00 · Planejamento · Ref. 5d0c7e19"
          isWhatsApp
          isSelected
          link={<a href="#evento" />}
        />
      </ul>,
    )

    const row = screen.container.querySelector('[data-slot=audit-event-row]') as HTMLElement
    expect(row.querySelector('[data-slot=avatar]')).toBeNull()
    expect(row.querySelector('svg.lucide-zap')).not.toBeNull()
    const detail = screen.getByText('pelo WhatsApp').element().parentElement as HTMLElement
    expect(detail.textContent?.startsWith('pelo WhatsApp')).toBe(true)
    expect(screen.getByRole('link').element().getAttribute('aria-current')).toBe('true')
  })

  it('keeps a long sentence to three lines at 360 px', async () => {
    await page.viewport(360, 640)
    const screen = await render(
      <ul>
        <AuditEventRow
          actorName="Member A"
          sentence={[{ text: 'Member A editou o lançamento muito longo '.repeat(8) }]}
          detail="11:05 · Lançamentos · Ref. a91b2f07"
        />
      </ul>,
    )

    const sentence = screen.container.querySelector('.line-clamp-3') as HTMLElement
    const lineHeight = Number.parseFloat(getComputedStyle(sentence).lineHeight)
    expect(sentence.getBoundingClientRect().height).toBeLessThanOrEqual(lineHeight * 3 + 1)
  })
})
