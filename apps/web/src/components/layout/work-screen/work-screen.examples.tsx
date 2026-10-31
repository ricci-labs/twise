import { WorkScreen } from '@web/components/layout/work-screen/work-screen'
import type { ComponentExamples } from '@web/lib/examples.types'

const ROWS = Array.from({ length: 40 }, (_, index) => `Linha ${index + 1}`)

export const workScreenExamples: ComponentExamples = {
  component: 'WorkScreen',
  examples: [
    {
      name: 'Lista e detalhe, cada um rolando sozinho',
      render: () => (
        <div className="flex h-120 flex-col">
          <WorkScreen
            listLabel="Lista"
            listHeader={<strong>Filtros</strong>}
            list={
              <ul>
                {ROWS.map((row) => (
                  <li key={row} className="border-border py-3 not-first:border-t">
                    {row}
                  </li>
                ))}
              </ul>
            }
            detailLabel="Detalhe"
            detailHeader={<strong>Mudança</strong>}
            detail={<p>O detalhe da linha escolhida rola sozinho.</p>}
          />
        </div>
      ),
    },
  ],
}
