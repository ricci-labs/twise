import { ShowMoreButton } from '@web/components/actions/show-more-button'
import { OccurrenceGroup } from '@web/components/finance/occurrence-group/occurrence-group'
import { OccurrenceRow } from '@web/components/finance/occurrence-row'
import type { ComponentExamples } from '@web/lib/examples.types'

function noop() {}

export const occurrenceGroupExamples: ComponentExamples = {
  component: 'OccurrenceGroup',
  examples: [
    {
      name: 'Atrasados, no cartão com a borda vermelha',
      render: () => (
        <div className="w-full max-w-100">
          <OccurrenceGroup title="Atrasados" count={1} tone="danger">
            <OccurrenceRow
              dueOn="2026-10-18"
              description="Internet"
              detail="Conta X · Casa › Internet"
              badge="overdue"
              amountCents={12000}
              direction="out"
              isOverdue
              register={{ label: 'Registrar pagamento de Internet', onPress: noop }}
            />
          </OccurrenceGroup>
        </div>
      ),
    },
    {
      name: 'Com o link de adicionar no cabeçalho',
      render: () => (
        <div className="w-full max-w-100">
          <OccurrenceGroup
            title="Contas e assinaturas"
            count={1}
            add={{ label: 'Nova conta fixa', onPress: noop }}
          >
            <OccurrenceRow
              dueOn="2026-11-05"
              description="Aluguel"
              detail="Conta X · Casa › Aluguel"
              amountCents={210000}
              direction="out"
            />
          </OccurrenceGroup>
        </div>
      ),
    },
    {
      name: 'A vencer, com "Mostrar mais"',
      render: () => (
        <div className="w-full max-w-100">
          <OccurrenceGroup
            title="A vencer"
            count={7}
            footer={<ShowMoreButton hiddenCount={2} onClick={noop} />}
          >
            <OccurrenceRow
              dueOn="2026-10-22"
              description="Luz"
              detail="Conta Y · Casa › Luz e água"
              amountCents={18000}
              direction="out"
              isEstimate
            />
            <OccurrenceRow
              dueOn="2026-10-23"
              description="Diarista"
              detail="Conta Y · Casa"
              amountCents={18000}
              direction="out"
            />
          </OccurrenceGroup>
        </div>
      ),
    },
    {
      name: 'Com nota no cabeçalho e vazio',
      render: () => (
        <div className="w-full max-w-100">
          <OccurrenceGroup
            title="Do espaço"
            count={0}
            note="Os feriados da cidade de vocês."
            add={{ label: 'Adicionar feriado', onPress: noop }}
            empty="Nenhum feriado do espaço. Adicione os da cidade de vocês (aniversário da cidade, padroeiro)."
          />
        </div>
      ),
    },
  ],
}
