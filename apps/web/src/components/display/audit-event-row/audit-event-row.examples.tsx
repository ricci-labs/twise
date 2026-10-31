import { AuditEventRow } from '@web/components/display/audit-event-row/audit-event-row'
import type { ComponentExamples } from '@web/lib/examples.types'
import { LONG_TEXT } from '@web/testing/long-text'

const LIST = 'w-full max-w-100 rounded-lg border border-border bg-surface px-4'

export const auditEventRowExamples: ComponentExamples = {
  component: 'AuditEventRow',
  examples: [
    {
      name: 'Pessoas, automático e WhatsApp',
      render: () => (
        <ul className={LIST}>
          <AuditEventRow
            actorName="Member A"
            sentence={[
              { text: 'Member A', isStrong: true },
              { text: ' registrou o lançamento ' },
              { text: 'Mercado', isStrong: true },
              { text: ' (R$ 86,40)' },
            ]}
            detail="14:10 · Lançamentos · Ref. c08e51d4"
            link={<a href="#evento" />}
          />
          <AuditEventRow
            actorName="Member B"
            sentence={[
              { text: 'Member B', isStrong: true },
              { text: ' registrou o lançamento ' },
              { text: 'Uber', isStrong: true },
              { text: ' (R$ 23,90)' },
            ]}
            detail="21:40 · Lançamentos · Ref. e3b8d602"
            isWhatsApp
            isSelected
            link={<a href="#evento" />}
          />
          <AuditEventRow
            actorName={null}
            sentence={[
              { text: 'Automático', isStrong: true },
              { text: ' criou o previsto ' },
              { text: 'Internet', isStrong: true },
            ]}
            detail="06:00 · Planejamento · Ref. 5d0c7e19"
            link={<a href="#evento" />}
          />
        </ul>
      ),
    },
    {
      name: 'Texto longo',
      render: () => (
        <ul className={LIST}>
          <AuditEventRow
            actorName={LONG_TEXT.person}
            sentence={[
              { text: LONG_TEXT.person, isStrong: true },
              { text: ' editou o lançamento ' },
              { text: LONG_TEXT.description, isStrong: true },
            ]}
            detail="11:05 · Membros e acesso · Ref. a91b2f07"
            link={<a href="#evento" />}
          />
        </ul>
      ),
    },
  ],
}
