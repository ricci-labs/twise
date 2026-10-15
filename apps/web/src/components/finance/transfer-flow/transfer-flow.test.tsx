import { TransferFlow } from '@web/components/finance/transfer-flow/transfer-flow'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'

describe('TransferFlow', () => {
  it('says where the money left from and where it went', async () => {
    const screen = await render(
      <TransferFlow
        from={{ name: 'Conta X', icon: 'wallet' }}
        to={{ name: 'Poupança', icon: 'piggy-bank' }}
      />,
    )

    await expect.element(screen.getByText('Saiu de')).toBeVisible()
    await expect.element(screen.getByText('Conta X')).toBeVisible()
    await expect.element(screen.getByText('Entrou em')).toBeVisible()
    await expect.element(screen.getByText('Poupança')).toBeVisible()
    await expectNoAccessibilityViolations(screen.container)
  })
})
