import { ChoiceChips } from '@web/components/inputs/choice-chips/choice-chips'
import type { ChoiceChipsProps } from '@web/components/inputs/choice-chips/choice-chips.types'
import type { ComponentExamples } from '@web/lib/examples.types'
import { useState } from 'react'

function Example(props: Omit<ChoiceChipsProps, 'value' | 'onSelect'> & { initial: string }) {
  const [value, setValue] = useState(props.initial)
  return (
    <div className="w-full max-w-100">
      <ChoiceChips {...props} value={value} onSelect={setValue} />
    </div>
  )
}

const TYPES = [
  { value: 'expense', label: 'Despesa' },
  { value: 'card_purchase', label: 'Compra no cartão' },
  { value: 'income', label: 'Receita' },
  { value: 'transfer', label: 'Transferência' },
  { value: 'more', label: 'Mais', icon: 'chevron', opensDialog: true },
] as const

const DATES = [
  { value: 'today', label: 'Hoje, 20 out' },
  { value: 'yesterday', label: 'Ontem' },
  { value: 'other', label: 'Outra data', icon: 'calendar', opensDialog: true },
] as const

const PEOPLE = [
  { value: 'a', label: 'Member A', avatarName: 'Member A' },
  { value: 'b', label: 'Member B', avatarName: 'Member B' },
] as const

const OWNERS = [
  ...PEOPLE,
  { value: '', label: 'Da casa', avatarName: 'Da casa', avatarIcon: 'home' },
] as const

export const choiceChipsExamples: ComponentExamples = {
  component: 'ChoiceChips',
  examples: [
    {
      name: 'Tipos (pílulas)',
      render: () => <Example label="Tipo de lançamento" options={TYPES} initial="expense" />,
    },
    {
      name: 'Datas (contorno)',
      render: () => <Example label="Data" variant="outline" options={DATES} initial="today" />,
    },
    {
      name: 'Quem gastou (cartões)',
      render: () => <Example label="Quem gastou" variant="card" options={PEOPLE} initial="a" />,
    },
    {
      name: 'De quem é (pessoas que quebram linha)',
      render: () => <Example label="De quem é" variant="member" options={OWNERS} initial="a" />,
    },
    {
      name: 'Desativado',
      render: () => (
        <Example label="Data" variant="outline" options={DATES} initial="today" isDisabled />
      ),
    },
  ],
}
