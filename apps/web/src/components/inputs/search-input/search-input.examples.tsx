import { SearchInput } from '@web/components/inputs/search-input/search-input'
import type { ComponentExamples } from '@web/lib/examples.types'
import { useState } from 'react'

function Example({ initial }: { initial: string }) {
  const [value, setValue] = useState(initial)
  return (
    <div className="w-full max-w-90">
      <SearchInput label="Buscar pela descrição" value={value} onValueChange={setValue} />
    </div>
  )
}

export const searchInputExamples: ComponentExamples = {
  component: 'SearchInput',
  examples: [
    { name: 'Vazio', render: () => <Example initial="" /> },
    { name: 'Com texto, e o "×" que limpa', render: () => <Example initial="Mercado" /> },
  ],
}
