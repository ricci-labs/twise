import { Button } from '@web/components/actions/button'
import { SettingsFormPage } from '@web/components/layout/settings-form-page/settings-form-page'
import type { ComponentExamples } from '@web/lib/examples.types'

const FIELD = 'rounded-md border border-border bg-surface px-4 py-3 text-body'

export const settingsFormPageExamples: ComponentExamples = {
  component: 'SettingsFormPage',
  examples: [
    {
      name: 'Com o botão de salvar no rodapé',
      render: () => (
        <SettingsFormPage
          back={<a href="#configuracoes" />}
          backLabel="Voltar para Configurações"
          title="Nome e moeda"
          footer={
            <Button width="full" disabled>
              Salvar nome
            </Button>
          }
        >
          <div className={FIELD}>Casa</div>
        </SettingsFormPage>
      ),
    },
    {
      name: 'Só para ver',
      render: () => (
        <SettingsFormPage
          back={<a href="#configuracoes" />}
          backLabel="Voltar para Configurações"
          title="Mês financeiro"
          readOnlyNote="Só donos e admins mudam as configurações. Peça a um deles."
          footer={<Button width="full">Salvar período</Button>}
        >
          <div className={FIELD}>Todo dia 5</div>
        </SettingsFormPage>
      ),
    },
  ],
}
