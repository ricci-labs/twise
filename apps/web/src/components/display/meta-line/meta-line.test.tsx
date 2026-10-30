import { MetaLine } from '@web/components/display/meta-line/meta-line'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { expectClampedToTwoLines } from '@web/testing/long-text'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'

const TEXT = '19/10 · mercado da semana · pelo WhatsApp'
const LONG_PIECE = 'internet fibra com TV, telefone fixo e mais um pacote de canais'

function visiblePieces(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>('[data-slot="meta-piece"]'))
}

function lineOf(piece: HTMLElement): number {
  return Math.round(piece.getBoundingClientRect().top)
}

describe('MetaLine', () => {
  it('keeps every piece with its dot on one line when it fits', async () => {
    const screen = await render(
      <p className="w-150 text-row-detail">
        <MetaLine text={TEXT} />
      </p>,
    )
    const pieces = visiblePieces(screen.container)

    expect(pieces.map((piece) => piece.textContent)).toEqual([
      '19/10',
      '· mercado da semana',
      '· pelo WhatsApp',
    ])
    expect(new Set(pieces.map(lineOf)).size).toBe(1)
    await expectNoAccessibilityViolations(screen.container)
  })

  it('drops a piece that does not fit whole to the next line, without its dot and capitalized', async () => {
    const screen = await render(
      <p className="w-36 text-row-detail">
        <MetaLine text={TEXT} />
      </p>,
    )
    const pieces = visiblePieces(screen.container)

    expect(pieces.map((piece) => piece.textContent)).toEqual([
      '19/10',
      'Mercado da semana',
      'Pelo WhatsApp',
    ])
    const [first, second, third] = pieces.map(lineOf)
    expect(second).toBeGreaterThan(first ?? 0)
    expect(third).toBeGreaterThan(second ?? 0)
  })

  it('still reads the dots to a screen reader when a piece drops', async () => {
    const screen = await render(
      <p className="w-36 text-row-detail">
        <MetaLine text={TEXT} />
      </p>,
    )
    const line = screen.container.querySelector('[data-slot="meta-line"]') as HTMLElement

    expect(line.textContent).toBe('19/10 · Mercado da semana · Pelo WhatsApp')
  })

  it('lets a piece longer than the line wrap and stops at two lines', async () => {
    const screen = await render(
      <p className="line-clamp-2 w-36 text-row-detail">
        <MetaLine text={`19/10 · ${LONG_PIECE} · pelo WhatsApp`} />
      </p>,
    )
    const box = screen.container.querySelector('p') as HTMLElement

    expectClampedToTwoLines(box)
  })

  it('counts what sits before it on the first line, like a badge', async () => {
    const screen = await render(
      <p className="w-60 text-row-detail">
        <span className="inline-block w-30" />
        <MetaLine text="19/10 · mercado da semana" />
      </p>,
    )
    const pieces = visiblePieces(screen.container)

    expect(pieces.map((piece) => piece.textContent)).toEqual(['19/10', 'Mercado da semana'])
  })

  it('measures again when the text changes', async () => {
    const screen = await render(
      <p className="w-36 text-row-detail">
        <MetaLine text={TEXT} />
      </p>,
    )
    await screen.rerender(
      <p className="w-36 text-row-detail">
        <MetaLine text="19/10 · ok" />
      </p>,
    )
    const pieces = visiblePieces(screen.container)

    expect(pieces.map((piece) => piece.textContent)).toEqual(['19/10', '· ok'])
  })
})
