import type { ChargeTag } from '@financas/shared'

export const chargeTextEditorMessages = {
  tagButtons: 'Inserir informação',
  tags: {
    '{contato}': 'Nome do contato',
    '{quem cobra}': 'Quem cobra',
    '{valor}': 'Valor',
    '{vencimento}': 'Vencimento',
    '{espaço}': 'Espaço',
  } satisfies Record<ChargeTag, string>,
} as const
