import { MiniMonthCalendar } from '@web/components/display/mini-month-calendar/mini-month-calendar'
import type { ComponentExamples } from '@web/lib/examples.types'

export const miniMonthCalendarExamples: ComponentExamples = {
  component: 'MiniMonthCalendar',
  examples: [
    {
      name: 'Mês com o próximo feriado e um do espaço',
      render: () => (
        <div className="grid w-full max-w-200 grid-cols-3 gap-4">
          <MiniMonthCalendar
            month="2026-10"
            today="2026-10-15"
            nextOn="2026-11-02"
            holidays={[{ onDate: '2026-10-12', name: 'Nossa Senhora Aparecida', kind: 'national' }]}
          />
          <MiniMonthCalendar
            month="2026-11"
            today="2026-10-15"
            nextOn="2026-11-02"
            holidays={[
              { onDate: '2026-11-02', name: 'Finados', kind: 'national' },
              { onDate: '2026-11-15', name: 'Proclamação da República', kind: 'national' },
              { onDate: '2026-11-20', name: 'Dia da Consciência Negra', kind: 'national' },
            ]}
          />
          <MiniMonthCalendar
            month="2026-12"
            today="2026-10-15"
            nextOn="2026-11-02"
            holidays={[
              { onDate: '2026-12-08', name: 'Padroeira da cidade', kind: 'workspace' },
              { onDate: '2026-12-25', name: 'Natal', kind: 'national' },
            ]}
          />
        </div>
      ),
    },
    {
      name: 'Mês que passou, sem feriados',
      render: () => (
        <div className="w-full max-w-70">
          <MiniMonthCalendar month="2026-03" today="2026-10-15" nextOn={null} holidays={[]} />
        </div>
      ),
    },
  ],
}
