import { CategoryArt } from '@web/components/display/category-art'
import { PickerField } from '@web/components/inputs/picker-field/picker-field'
import type { ComponentExamples } from '@web/lib/examples.types'
import type { ReactNode } from 'react'

function Labelled({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div className="flex w-full max-w-100 flex-col gap-2">
      <label htmlFor={id} className="text-label text-ink">
        {label}
      </label>
      {children}
    </div>
  )
}

export const pickerFieldExamples: ComponentExamples = {
  component: 'PickerField',
  examples: [
    {
      name: 'Conta escolhida',
      render: () => (
        <Labelled id="paid-from" label="Pago com">
          <PickerField
            id="paid-from"
            value="Conta X"
            detail="Saldo de hoje: R$ 4.200,00"
            art={<CategoryArt name="Conta X" icon="wallet" />}
            placeholder="Escolha uma conta"
          />
        </Labelled>
      ),
    },
    {
      name: 'Cartão escolhido',
      render: () => (
        <Labelled id="card" label="Cartão">
          <PickerField
            id="card"
            value="Cartão X"
            detail="Fecha 25/10 · vence 04/11"
            art={<CategoryArt name="Cartão X" icon="card" />}
            placeholder="Escolha um cartão"
          />
        </Labelled>
      ),
    },
    {
      name: 'Vazio',
      render: () => (
        <Labelled id="category" label="Categoria">
          <PickerField id="category" value={null} placeholder="Escolha uma categoria" />
        </Labelled>
      ),
    },
    {
      name: 'Com erro',
      render: () => (
        <Labelled id="category-error" label="Categoria">
          <PickerField
            id="category-error"
            value={null}
            aria-invalid
            placeholder="Escolha uma categoria"
          />
        </Labelled>
      ),
    },
  ],
}
