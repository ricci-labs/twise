import { MemberRow } from '@web/components/display/member-row/member-row'
import type { ComponentExamples } from '@web/lib/examples.types'
import { LONG_TEXT } from '@web/testing/long-text'

const LIST = 'w-full max-w-100 rounded-lg border border-border bg-surface px-4'

export const memberRowExamples: ComponentExamples = {
  component: 'MemberRow',
  examples: [
    {
      name: 'Você e outra pessoa',
      render: () => (
        <ul className={LIST}>
          <MemberRow
            name="Member A"
            email="member.a@exemplo.com"
            roleName="Dono"
            joinedOn="2026-10-02"
            isYou
          />
          <MemberRow
            name="Member B"
            email="member.b@exemplo.com"
            roleName="Admin"
            joinedOn="2026-10-03"
          />
        </ul>
      ),
    },
    {
      name: 'Texto longo',
      render: () => (
        <ul className={LIST}>
          <MemberRow
            name={LONG_TEXT.person}
            email={LONG_TEXT.email}
            roleName="Membro"
            joinedOn="2026-10-04"
          />
        </ul>
      ),
    },
  ],
}
