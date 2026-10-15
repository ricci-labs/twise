import { CategoryArt } from '@web/components/display/category-art'
import {
  DetailRow,
  DetailRows,
  DetailSection,
} from '@web/components/display/detail-section/detail-section'
import type { ComponentExamples } from '@web/lib/examples.types'

export const detailSectionExamples: ComponentExamples = {
  component: 'DetailSection',
  examples: [
    {
      name: 'Detalhes de um lançamento',
      render: () => (
        <div className="w-full max-w-90">
          <DetailSection title="Detalhes">
            <DetailRows>
              <DetailRow label="Cartão">
                <CategoryArt name="Cartão X" icon="card" size="sm" />
                Cartão X
              </DetailRow>
              <DetailRow label="Forma de pagamento">Crédito</DetailRow>
              <DetailRow label="Registrado por">Member A, pela web</DetailRow>
            </DetailRows>
          </DetailSection>
        </div>
      ),
    },
    {
      name: 'Observações',
      render: () => (
        <div className="w-full max-w-90">
          <DetailSection title="Observações">
            <p className="text-dialog-text">Para a meia maratona de dezembro.</p>
          </DetailSection>
        </div>
      ),
    },
  ],
}
