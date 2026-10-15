import { ListEnd } from '@web/components/feedback/list-end/list-end'
import type { ComponentExamples } from '@web/lib/examples.types'
import type { ReactNode } from 'react'

function PreviousLink({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <a href="#anterior" className={className}>
      {children}
    </a>
  )
}

export const listEndExamples: ComponentExamples = {
  component: 'ListEnd',
  examples: [
    {
      name: 'Fim do período, com o anterior',
      render: () => (
        <ListEnd
          message="Isso é tudo de out/26."
          previous={{ label: 'Ver set/26', link: <PreviousLink /> }}
        />
      ),
    },
    {
      name: 'Fim com filtros',
      render: () => <ListEnd message="Isso é tudo com esses filtros em out/26." />,
    },
  ],
}
