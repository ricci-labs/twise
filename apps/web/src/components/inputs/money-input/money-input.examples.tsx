import { MoneyInput } from '@web/components/inputs/money-input/money-input'
import type { MoneyInputProps } from '@web/components/inputs/money-input/money-input.types'
import type { ComponentExamples } from '@web/lib/examples.types'
import { useState } from 'react'

function Example({ initial, ...props }: Partial<MoneyInputProps> & { initial: string }) {
  const [value, setValue] = useState(initial)
  return (
    <div className="flex w-full max-w-100 flex-col gap-2">
      <label htmlFor={props.id} className="text-label text-ink">
        Valor
      </label>
      <MoneyInput {...props} value={value} onChange={(event) => setValue(event.target.value)} />
    </div>
  )
}

export const moneyInputExamples: ComponentExamples = {
  component: 'MoneyInput',
  examples: [
    { name: 'Grande, vazio', render: () => <Example id="money-lg" size="lg" initial="" /> },
    {
      name: 'Grande, preenchido',
      render: () => <Example id="money-lg-2" size="lg" initial="86,40" />,
    },
    {
      name: 'Saldo negativo',
      render: () => <Example id="money-neg" size="lg" isNegative initial="1.200,00" />,
    },
    {
      name: 'Com erro',
      render: () => <Example id="money-error" size="lg" aria-invalid initial="0,00" />,
    },
    { name: 'Médio', render: () => <Example id="money-md" initial="333,34" /> },
    {
      name: 'Pequeno (divisão)',
      render: () => <Example id="money-sm" size="sm" initial="80,00" />,
    },
    {
      name: 'Só leitura',
      render: () => <Example id="money-ro" size="lg" readOnly initial="240,00" />,
    },
  ],
}
