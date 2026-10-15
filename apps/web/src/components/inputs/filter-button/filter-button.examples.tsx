import { FilterButton } from '@web/components/inputs/filter-button/filter-button'
import type { ComponentExamples } from '@web/lib/examples.types'
import { useState } from 'react'

function Toggle() {
  const [isPressed, setIsPressed] = useState(false)
  return (
    <FilterButton
      label="Só os divididos"
      hasMenu={false}
      isActive={isPressed}
      aria-pressed={isPressed}
      onClick={() => setIsPressed(!isPressed)}
    />
  )
}

export const filterButtonExamples: ComponentExamples = {
  component: 'FilterButton',
  examples: [
    { name: 'Sem filtro', render: () => <FilterButton label="Categoria" /> },
    {
      name: 'Com o valor escolhido',
      render: () => <FilterButton label="Tipo" value="Compra no cartão" />,
    },
    { name: 'Liga e desliga, sem menu', render: () => <Toggle /> },
  ],
}
