import { LinkedItem } from '@web/components/finance/linked-item/linked-item'
import type { LinkedItemLinkProps } from '@web/components/finance/linked-item/linked-item.types'
import type { ComponentExamples } from '@web/lib/examples.types'

function Somewhere({ className, children }: LinkedItemLinkProps) {
  return (
    <a href="#lugar" className={className}>
      {children}
    </a>
  )
}

export const linkedItemExamples: ComponentExamples = {
  component: 'LinkedItem',
  examples: [
    {
      name: 'Histórico e conta prevista',
      render: () => (
        <div className="flex w-full max-w-90 flex-col gap-3">
          <LinkedItem icon="history" label="Histórico deste lançamento" link={<Somewhere />} />
          <LinkedItem
            icon="calendar"
            label="Pagou a conta prevista Aluguel de outubro"
            link={<Somewhere />}
          />
          <LinkedItem
            tone="mint"
            icon="ok"
            label="Divisão sugerida feita · 4 de 4 partes"
            link={<Somewhere />}
          />
        </div>
      ),
    },
  ],
}
