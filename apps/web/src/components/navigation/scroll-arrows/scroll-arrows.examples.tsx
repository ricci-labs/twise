import { ScrollArrows } from '@web/components/navigation/scroll-arrows/scroll-arrows'
import type { ComponentExamples } from '@web/lib/examples.types'
import { useRef } from 'react'

const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

function Example() {
  const stripRef = useRef<HTMLUListElement>(null)
  return (
    <div className="w-full max-w-100">
      <ScrollArrows scrollerRef={stripRef}>
        <ul ref={stripRef} className="flex gap-2 overflow-x-auto scrollbar-none">
          {MONTHS.map((month) => (
            <li
              key={month}
              className="shrink-0 rounded-md border border-border-control bg-surface px-5 py-3 text-choice text-ink"
            >
              {month}
            </li>
          ))}
        </ul>
      </ScrollArrows>
    </div>
  )
}

export const scrollArrowsExamples: ComponentExamples = {
  component: 'ScrollArrows',
  examples: [{ name: 'Faixa de meses no computador', render: () => <Example /> }],
}
