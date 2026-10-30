import { SettingsRow } from '@web/components/navigation/settings-row/settings-row'
import type { ComponentExamples } from '@web/lib/examples.types'
import { CalendarDays, Target } from 'lucide-react'
import type { ReactNode } from 'react'

function Card({ children }: { children: ReactNode }) {
  return (
    <ul className="w-full max-w-100 rounded-lg border border-border bg-surface px-3 py-1">
      {children}
    </ul>
  )
}

export const settingsRowExamples: ComponentExamples = {
  component: 'SettingsRow',
  examples: [
    {
      name: 'Feriados e a base dos orçamentos',
      render: () => (
        <Card>
          <SettingsRow
            title="Feriados"
            detail="15 em 2026 · próximo: Finados, 02/11"
            icon={<CalendarDays />}
            link={<a href="#feriados" />}
          />
          <SettingsRow
            title="Base dos orçamentos"
            detail="Período financeiro"
            icon={<Target />}
            link={<a href="#orcamentos" />}
          />
        </Card>
      ),
    },
  ],
}
