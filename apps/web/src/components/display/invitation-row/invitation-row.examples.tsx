import { InvitationRow } from '@web/components/display/invitation-row/invitation-row'
import type { ComponentExamples } from '@web/lib/examples.types'

const LIST = 'w-full max-w-100 rounded-lg border border-border bg-surface px-4'

export const invitationRowExamples: ComponentExamples = {
  component: 'InvitationRow',
  examples: [
    {
      name: 'Por e-mail e por telefone',
      render: () => (
        <ul className={LIST}>
          <InvitationRow
            channel="email"
            contact="member.c@exemplo.com"
            roleName="Contador"
            isCustomRole
            expiresOn="2026-10-24"
            invitedBy="Member A"
            invitedOn="2026-10-17"
          />
          <InvitationRow
            channel="phone"
            contact="+55 (11) 99999-0005"
            roleName="Leitor"
            isCustomRole={false}
            expiresOn="2026-10-26"
            invitedBy="Member B"
            invitedOn="2026-10-19"
          />
        </ul>
      ),
    },
  ],
}
