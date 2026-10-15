import { TrashTabs } from '@web/components/navigation/trash-tabs/trash-tabs'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'

describe('TrashTabs', () => {
  it('switches between the entries and the accounts of the trash', async () => {
    const onChange = vi.fn()
    const screen = await render(<TrashTabs value="entries" onChange={onChange} />)

    await screen.getByRole('button', { name: 'Contas e categorias' }).click()
    expect(onChange).toHaveBeenCalledWith('accounts')
    await expectNoAccessibilityViolations(screen.container)
  })
})
