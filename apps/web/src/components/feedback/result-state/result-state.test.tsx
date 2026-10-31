import { Button } from '@web/components/actions/button'
import { ResultState } from '@web/components/feedback/result-state/result-state'
import { TwiseIcon } from '@web/components/icons/twise-icon'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'

describe('ResultState', () => {
  it('explains what will appear, as a named region with a dashed frame', async () => {
    const screen = await render(
      <ResultState
        frame="dashed"
        art={<TwiseIcon name="bag" />}
        title="Quanto custa o que vocês querem comprar?"
        text="O resultado aparece sozinho."
      />,
    )

    const region = screen.getByRole('region', { name: 'Quanto custa o que vocês querem comprar?' })
    await expect.element(region.getByText('O resultado aparece sozinho.')).toBeVisible()
    expect(region.element().className).toContain('border-dashed')
    await expectNoAccessibilityViolations(screen.container)
  })

  it('announces an error with its code, reference and a way to try again', async () => {
    const screen = await render(
      <ResultState
        isAlert
        tone="danger"
        art={<TwiseIcon name="alert" />}
        title="Não deu para simular agora"
        text="Foi um erro do nosso lado."
        detail="Código SERVER_ERROR · Ref. 3f9a7c21"
        action={<Button variant="secondary">Tentar de novo</Button>}
      />,
    )

    const alert = screen.getByRole('alert')
    await expect.element(alert.getByText('Não deu para simular agora')).toBeVisible()
    await expect.element(alert.getByText('Código SERVER_ERROR')).toBeVisible()
    await expect.element(alert.getByRole('button', { name: 'Tentar de novo' })).toBeVisible()
    await expectNoAccessibilityViolations(screen.container)
  })
})
