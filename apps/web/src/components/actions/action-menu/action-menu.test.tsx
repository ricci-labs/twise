import { ActionMenu } from '@web/components/actions/action-menu/action-menu'
import { Button } from '@web/components/actions/button'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { createElement } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { userEvent } from 'vitest/browser'
import { render } from 'vitest-browser-react'

function renderMenu(onLeave = vi.fn()) {
  return render(
    <ActionMenu
      trigger={<Button variant="outline">Member A</Button>}
      header="member.a@exemplo.com"
      groups={[
        [
          {
            key: 'account',
            label: 'Minha conta',
            icon: 'user',
            render: createElement('a', { href: '/conta' }),
          },
        ],
        [{ key: 'leave', label: 'Sair', icon: 'out', onSelect: onLeave }],
      ]}
    />,
  )
}

describe('ActionMenu', () => {
  it('opens a menu of items from its trigger, with links and actions', async () => {
    const onLeave = vi.fn()
    const screen = await renderMenu(onLeave)

    await screen.getByRole('button', { name: 'Member A' }).click()

    await expect.element(screen.getByRole('menu')).toBeVisible()
    await expect
      .element(screen.getByRole('menuitem', { name: 'Minha conta' }))
      .toHaveAttribute('href', '/conta')
    await expectNoAccessibilityViolations(screen.getByRole('menu').element())
    await screen.getByRole('menuitem', { name: 'Sair' }).click()
    expect(onLeave).toHaveBeenCalledOnce()
  })

  it('works from the keyboard and closes with Escape', async () => {
    const screen = await renderMenu()
    const trigger = screen.getByRole('button', { name: 'Member A' })

    await trigger.click()
    await expect.element(screen.getByRole('menu')).toBeVisible()
    await userEvent.keyboard('{Escape}')

    await expect.element(screen.getByRole('menu')).not.toBeInTheDocument()
    await expect.element(trigger).toHaveFocus()
  })
})
