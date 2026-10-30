import { ThemeCards } from '@web/components/inputs/theme-cards/theme-cards'
import type { ComponentExamples } from '@web/lib/examples.types'
import type { ThemeChoice } from '@web/lib/theme.types'
import { useState } from 'react'

function Example() {
  const [value, setValue] = useState<ThemeChoice>('light')
  return <ThemeCards label="Tema" value={value} onChange={setValue} className="max-w-100" />
}

export const themeCardsExamples: ComponentExamples = {
  component: 'ThemeCards',
  examples: [{ name: 'Claro, escuro e automático', render: () => <Example /> }],
}
