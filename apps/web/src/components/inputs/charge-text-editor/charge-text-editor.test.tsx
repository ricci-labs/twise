import {
  ChargeTagButtons,
  ChargeTextEditor,
} from '@web/components/inputs/charge-text-editor/charge-text-editor'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { userEvent } from 'vitest/browser'
import { render } from 'vitest-browser-react'

const OPENING =
  '{quem cobra} pediu para te lembrar do que está em aberto. Dá para pagar com Pix, o valor já vem preenchido.'

function Editor({ initial, isSingleLine }: { initial: string; isSingleLine?: boolean }) {
  const [value, setValue] = useState(initial)
  return (
    <div className="w-80">
      <label htmlFor="text">Abertura</label>
      <ChargeTextEditor
        id="text"
        value={value}
        isSingleLine={isSingleLine}
        onChange={(event) => setValue(event.target.value)}
      />
      <output>{JSON.stringify(value)}</output>
    </div>
  )
}

function marks(container: HTMLElement) {
  return [...container.querySelectorAll<HTMLElement>('[data-slot=charge-text-tag]')].map((mark) => [
    mark.textContent,
    mark.dataset.tone,
  ])
}

describe('ChargeTextEditor', () => {
  it('is a plain text field named by its label, with the tags marked behind the text', async () => {
    const screen = await render(<Editor initial={`${OPENING} {apelido} {valor}`} />)
    const field = screen.getByRole('textbox', { name: 'Abertura' })

    await expect.element(field).toHaveValue(`${OPENING} {apelido} {valor}`)
    expect(marks(screen.container)).toEqual([
      ['{quem cobra}', 'tag'],
      ['{apelido}', 'unknown'],
      ['{valor}', 'tag'],
    ])
    await expectNoAccessibilityViolations(screen.container)
  })

  it('marks a tag as it is typed and grows with the text, line for line with the marks', async () => {
    const screen = await render(<Editor initial="" />)
    const field = screen.getByRole('textbox', { name: 'Abertura' })
    const frame = screen.container.querySelector('[data-slot=charge-text-editor]') as HTMLElement
    const oneLineHeight = frame.offsetHeight

    await field.fill(`${OPENING}\n\nAté {vencimento}`)
    expect(marks(screen.container)).toEqual([
      ['{quem cobra}', 'tag'],
      ['{vencimento}', 'tag'],
    ])
    const textarea = field.element() as HTMLTextAreaElement
    const backdrop = textarea.previousElementSibling as HTMLElement
    expect(frame.offsetHeight).toBeGreaterThan(oneLineHeight * 2.5)
    expect(textarea.scrollHeight).toBe(textarea.clientHeight)
    expect(Math.abs(backdrop.offsetHeight - textarea.offsetHeight)).toBeLessThanOrEqual(1)
  })

  it('keeps a one-line field on one line: Enter does nothing and a pasted break becomes a space', async () => {
    const screen = await render(<Editor initial="Assunto" isSingleLine />)
    const field = screen.getByRole('textbox', { name: 'Abertura' })

    await field.click()
    await userEvent.keyboard('{End}{Enter}!')
    await expect.element(screen.getByText('"Assunto!"')).toBeVisible()
    await field.fill('Primeira\nSegunda')
    await expect.element(screen.getByText('"Primeira Segunda"')).toBeVisible()
  })

  it('shows read-only and invalid states on the whole field', async () => {
    const screen = await render(
      <ChargeTextEditor
        aria-label="Abertura"
        value={OPENING}
        onChange={vi.fn()}
        readOnly
        aria-invalid
      />,
    )
    const frame = screen.container.querySelector('[data-slot=charge-text-editor]') as HTMLElement

    expect(frame.dataset.readOnly).toBe('')
    expect(frame.dataset.invalid).toBe('')
    await expect
      .element(screen.getByRole('textbox', { name: 'Abertura' }))
      .toHaveAttribute('readonly')
  })
})

describe('ChargeTagButtons', () => {
  it('offers each tag by its name and keeps the focus in the field it inserts into', async () => {
    const onInsert = vi.fn()
    const screen = await render(
      <>
        <ChargeTextEditor aria-label="Abertura" value="" onChange={vi.fn()} />
        <ChargeTagButtons onInsert={onInsert} />
      </>,
    )
    const group = screen.getByRole('group', { name: 'Inserir informação' })
    const field = screen.getByRole('textbox', { name: 'Abertura' })

    await expect.element(group).toHaveTextContent('Nome do contatoQuem cobraValorVencimentoEspaço')
    await field.click()
    await screen.getByRole('button', { name: 'Quem cobra' }).click()
    expect(onInsert).toHaveBeenCalledWith('{quem cobra}')
    await expect.element(field).toHaveFocus()
    await expectNoAccessibilityViolations(screen.container)
  })
})
