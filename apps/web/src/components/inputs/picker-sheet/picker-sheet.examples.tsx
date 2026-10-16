import { Button } from '@web/components/actions/button'
import { PickerSheet } from '@web/components/inputs/picker-sheet/picker-sheet'
import type { PickerSheetProps } from '@web/components/inputs/picker-sheet/picker-sheet.types'
import type { ComponentExamples } from '@web/lib/examples.types'
import { useRef, useState } from 'react'

const ACCOUNTS = [
  { value: 'x', label: 'Conta X', detail: 'Saldo de hoje: R$ 4.200,00', icon: 'wallet' },
  { value: 'y', label: 'Conta Y', detail: 'Saldo de hoje: R$ 2.800,00', icon: 'wallet' },
  { value: 'cash', label: 'Dinheiro', detail: 'Saldo de hoje: R$ 150,00', icon: 'coin' },
]

const CATEGORIES = [
  {
    value: 'groceries',
    label: 'Mercado',
    icon: 'groceries',
    children: [
      { value: 'fair', label: 'Feira' },
      { value: 'bakery', label: 'Padaria' },
    ],
  },
  {
    value: 'house',
    label: 'Casa',
    icon: 'house',
    children: [
      { value: 'rent', label: 'Aluguel' },
      { value: 'power', label: 'Luz' },
      { value: 'water', label: 'Água' },
    ],
  },
  { value: 'transport', label: 'Transporte', icon: 'transport' },
  { value: 'leisure', label: 'Lazer', icon: 'leisure' },
  { value: 'health', label: 'Saúde', icon: 'health' },
  { value: 'bills', label: 'Contas da casa', icon: 'receipt' },
]

const REPEATS = [
  { value: 'monthly', label: 'Todo mês' },
  { value: 'weekly', label: 'Toda semana' },
  { value: 'yearly', label: 'Todo ano' },
]

function Example(props: Omit<PickerSheetProps, 'isOpen' | 'onOpenChange' | 'value' | 'onSelect'>) {
  const [isOpen, setIsOpen] = useState(false)
  const [value, setValue] = useState<string | null>(props.items[0]?.value ?? null)
  const anchor = useRef<HTMLButtonElement>(null)
  return (
    <>
      <Button ref={anchor} variant="subtle" size="sm" onClick={() => setIsOpen(true)}>
        {`Abrir: ${props.title}`}
      </Button>
      <PickerSheet
        {...props}
        anchor={anchor}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        value={value}
        onSelect={setValue}
      />
    </>
  )
}

export const pickerSheetExamples: ComponentExamples = {
  component: 'PickerSheet',
  examples: [
    {
      name: 'Lista de contas',
      render: () => (
        <Example title="Pago com" subtitle="Só contas de dinheiro ativas" items={ACCOUNTS} />
      ),
    },
    {
      name: 'Grade de categorias com busca',
      render: () => (
        <Example
          title="Categoria"
          subtitle="Categorias de despesa"
          layout="grid"
          searchLabel="Buscar categoria"
          items={CATEGORIES}
        />
      ),
    },
    {
      name: 'Opções simples',
      render: () => <Example title="Repetir" layout="options" items={REPEATS} />,
    },
    {
      name: 'Ainda sem conta',
      render: () => (
        <Example
          title="Pago com"
          items={[]}
          empty={{
            icon: 'wallet',
            title: 'Vocês ainda não têm uma conta de dinheiro.',
            text: 'Cadastre a primeira (conta corrente, poupança ou carteira) para registrar despesas.',
            actionLabel: 'Cadastrar conta',
            onAction: () => undefined,
          }}
        />
      ),
    },
  ],
}
