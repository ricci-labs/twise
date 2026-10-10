import { CategoryArt } from '@web/components/display/category-art/category-art'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'

describe('CategoryArt', () => {
  it('draws the illustration of a known icon, or the initial, always decorative', async () => {
    const screen = await render(
      <p>
        <CategoryArt name="Mercado" icon="groceries" /> Mercado
        <CategoryArt name="outros" icon={null} /> Outros
      </p>,
    )
    const [known, unknown] = screen.container.querySelectorAll('[data-slot=category-art]')

    expect(known?.querySelector('img')?.getAttribute('src')).toContain('groceries')
    expect(unknown?.textContent).toBe('O')
    expect(known?.getAttribute('aria-hidden')).toBe('true')
  })
})
