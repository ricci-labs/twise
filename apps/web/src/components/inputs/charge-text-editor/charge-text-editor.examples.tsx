import {
  ChargeTagButtons,
  ChargeTextEditor,
} from '@web/components/inputs/charge-text-editor/charge-text-editor'
import type { ComponentExamples } from '@web/lib/examples.types'
import { useState } from 'react'

const OPENING =
  '{quem cobra} pediu para te lembrar do que está em aberto. Dá para pagar com Pix, o valor já vem preenchido.'

function EditableExample({ initial, isInvalid = false }: { initial: string; isInvalid?: boolean }) {
  const [value, setValue] = useState(initial)
  return (
    <div className="flex w-full max-w-90 flex-col gap-3">
      <ChargeTextEditor
        aria-label="Abertura"
        aria-invalid={isInvalid || undefined}
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      <ChargeTagButtons onInsert={(tag) => setValue((text) => `${text}${tag}`)} />
    </div>
  )
}

export const chargeTextEditorExamples: ComponentExamples = {
  component: 'ChargeTextEditor',
  examples: [
    { name: 'Abertura com etiquetas', render: () => <EditableExample initial={OPENING} /> },
    {
      name: 'Assunto em uma linha',
      render: () => (
        <ChargeTextEditor
          aria-label="Assunto do e-mail"
          isSingleLine
          value="{quem cobra} te enviou uma cobrança de {valor}"
          onChange={() => undefined}
          className="max-w-90"
        />
      ),
    },
    {
      name: 'Informação desconhecida',
      render: () => <EditableExample initial={`${OPENING} {apelido}`} isInvalid />,
    },
    {
      name: 'Só leitura',
      render: () => (
        <ChargeTextEditor
          aria-label="Abertura"
          readOnly
          value={OPENING}
          onChange={() => undefined}
          className="max-w-90"
        />
      ),
    },
  ],
}
