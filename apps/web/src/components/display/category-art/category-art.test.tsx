import { CategoryArt } from '@web/components/display/category-art/category-art'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'

describe('CategoryArt', () => {
  it('draws the loose illustration of a known icon, or the initial, always decorative', async () => {
    const screen = await render(
      <p>
        <CategoryArt name="Mercado" icon="groceries" /> Mercado
        <CategoryArt name="outros" icon={null} /> Outros
      </p>,
    )
    const [known, unknown] = screen.container.querySelectorAll('[data-slot=category-art]')

    expect(known?.querySelector('img')?.getAttribute('src')).toContain('loose/groceries')
    expect(unknown?.textContent).toBe('O')
    expect(known?.getAttribute('aria-hidden')).toBe('true')
  })

  it('switches to the drawing on paper in the dark theme, where the loose ink would vanish', async () => {
    const screen = await render(
      <div className="dark">
        <CategoryArt name="Mercado" icon="groceries" />
      </div>,
    )
    const [loose, onPaper] = screen.container.querySelectorAll('img')

    expect(loose && getComputedStyle(loose).display).toBe('none')
    expect(onPaper && getComputedStyle(onPaper).display).not.toBe('none')
    expect(onPaper?.getAttribute('src')).not.toContain('loose/')
  })

  it('never clips the drawing in a circle', async () => {
    const screen = await render(<CategoryArt name="Mercado" icon="groceries" />)
    const art = screen.container.querySelector('[data-slot=category-art]')
    expect(art?.className).not.toContain('rounded-full')
  })

  it('keeps the loose drawing on a surface that is light in both themes', async () => {
    const screen = await render(
      <div className="dark">
        <CategoryArt name="Mercado" icon="groceries" variant="onLight" size="xl" />
        <CategoryArt name="Viagem" icon="travel" />
      </div>,
    )
    const [onLight, travel] = screen.container.querySelectorAll('[data-slot=category-art] img')

    expect(onLight?.getAttribute('src')).toContain('loose/groceries')
    expect(onLight && getComputedStyle(onLight).display).not.toBe('none')
    expect(travel?.getAttribute('src')).toContain('loose/travel')
  })
})
