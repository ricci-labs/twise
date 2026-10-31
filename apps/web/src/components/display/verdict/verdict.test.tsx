import { Verdict } from '@web/components/display/verdict/verdict'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'

describe('Verdict', () => {
  it('says the verdict with one sentence below, in the colour of its tone', async () => {
    const screen = await render(
      <Verdict
        tone="warn"
        title="Cabe, mas aperta."
        text="Dezembro chegaria a 70% da renda fixa comprometida."
      />,
    )

    await expect.element(screen.getByText('Cabe, mas aperta.')).toBeVisible()
    await expect
      .element(screen.getByText('Dezembro chegaria a 70% da renda fixa comprometida.'))
      .toBeVisible()
    const box = screen.container.querySelector('[data-slot=verdict]') as HTMLElement
    expect(box.dataset.tone).toBe('warn')
    expect(box.className).toContain('bg-warning-soft')
    await expectNoAccessibilityViolations(screen.container)
  })

  it('paints the title red when it does not fit', async () => {
    const screen = await render(
      <Verdict tone="alert" title="Não cabe sem estourar." text="Passaria da renda." />,
    )

    const title = screen.getByText('Não cabe sem estourar.').element()
    const danger = document.createElement('span')
    danger.className = 'text-danger'
    document.body.append(danger)
    expect(getComputedStyle(title).color).toBe(getComputedStyle(danger).color)
    danger.remove()
    expect(title.closest('[data-tone=alert]')).not.toBeNull()
    await expectNoAccessibilityViolations(screen.container)
  })
})
