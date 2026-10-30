import { RoleCard } from '@web/components/display/role-card/role-card'
import type { ComponentExamples } from '@web/lib/examples.types'

const LIST = 'w-full max-w-100 rounded-lg border border-border bg-surface px-4'

export const roleCardExamples: ComponentExamples = {
  component: 'RoleCard',
  examples: [
    {
      name: 'Sistema, do espaço e o dono travado',
      render: () => (
        <ul className={LIST}>
          <RoleCard
            name="Dono"
            description="Tudo, inclusive membros, papéis e configurações."
            isSystem
            isLocked
            memberCount={1}
            invitationCount={0}
          />
          <RoleCard
            name="Membro"
            description="Lança, edita e planeja."
            isSystem
            memberCount={0}
            invitationCount={0}
          />
          <RoleCard
            name="Contador"
            description="Vê tudo e anexa comprovantes. Não muda valores."
            isSystem={false}
            memberCount={2}
            invitationCount={1}
          />
        </ul>
      ),
    },
  ],
}
