import type { Permission } from '@financas/shared'
import { PermissionRows } from '@web/components/inputs/permission-rows/permission-rows'
import type { PermissionArea } from '@web/components/inputs/permission-rows/permission-rows.types'
import type { ComponentExamples } from '@web/lib/examples.types'
import { useState } from 'react'

const AREAS: readonly PermissionArea[] = [
  { module: 'entries', label: 'Lançamentos' },
  { module: 'reports', label: 'Relatórios' },
  { module: 'settings', label: 'Configurações' },
  { module: 'members', label: 'Membros' },
]

const ALL: readonly Permission[] = [
  ...(['view', 'create', 'update', 'delete'] as const).map((action) => ({
    module: 'entries' as const,
    action,
  })),
  { module: 'reports', action: 'view' },
  { module: 'settings', action: 'view' },
  { module: 'settings', action: 'update' },
  { module: 'members', action: 'view' },
  { module: 'members', action: 'update' },
]

function Example({ start }: { start: readonly Permission[] }) {
  const [value, setValue] = useState<readonly Permission[]>(start)
  return (
    <div className="w-full max-w-100">
      <PermissionRows
        label="Permissões"
        areas={AREAS}
        value={value}
        allowed={ALL}
        onChange={setValue}
      />
    </div>
  )
}

export const permissionRowsExamples: ComponentExamples = {
  component: 'PermissionRows',
  examples: [
    { name: 'Vazio; Excluir em Membros com cadeado', render: () => <Example start={[]} /> },
    {
      name: 'Marcado',
      render: () => (
        <Example
          start={[
            { module: 'entries', action: 'view' },
            { module: 'entries', action: 'create' },
          ]}
        />
      ),
    },
  ],
}
