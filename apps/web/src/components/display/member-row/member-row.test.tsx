import { MemberRow } from '@web/components/display/member-row/member-row'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { expectClampedToTwoLines, LONG_TEXT } from '@web/testing/long-text'
import { describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { render } from 'vitest-browser-react'

describe('MemberRow', () => {
  it('shows the name with "você", the e-mail alone, then the role and since when', async () => {
    const screen = await render(
      <ul>
        <MemberRow
          name="Member A"
          email="member.a@exemplo.com"
          roleName="Dono"
          joinedOn="2026-10-02"
          isYou
          actions={<button type="button">Ações de Member A</button>}
        />
      </ul>,
    )

    await expect.element(screen.getByText('Member A', { exact: true })).toBeVisible()
    await expect.element(screen.getByText('você')).toBeVisible()
    await expect.element(screen.getByText('member.a@exemplo.com')).toBeVisible()
    await expect.element(screen.getByText('Dono')).toBeVisible()
    await expect.element(screen.getByText('Desde 02/10/2026')).toBeVisible()
    await expect.element(screen.getByRole('button', { name: 'Ações de Member A' })).toBeVisible()
    await expectNoAccessibilityViolations(screen.container)
  })

  it('keeps a long name and a long e-mail to two lines each at 360 px', async () => {
    await page.viewport(360, 640)
    const screen = await render(
      <ul>
        <MemberRow
          name={LONG_TEXT.person.repeat(3)}
          email={LONG_TEXT.email.repeat(2)}
          roleName="Membro"
          joinedOn="2026-10-04"
        />
      </ul>,
    )

    expectClampedToTwoLines(screen.getByText(LONG_TEXT.person.repeat(3)).element())
    const email = screen.getByText(LONG_TEXT.email.repeat(2)).element()
    expectClampedToTwoLines(email)
    const row = screen.container.querySelector('[data-slot=member-row]') as HTMLElement
    expect(email.getBoundingClientRect().right).toBeLessThanOrEqual(
      row.getBoundingClientRect().right,
    )
    expect(email.scrollWidth).toBeLessThanOrEqual(email.clientWidth)
  })
})
