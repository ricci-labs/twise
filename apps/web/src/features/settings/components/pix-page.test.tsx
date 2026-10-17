import { createMemoryHistory } from '@tanstack/react-router'
import { AppProviders } from '@web/app/providers'
import { createApp } from '@web/app/router'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import {
  accessAs,
  account,
  apiError,
  fakeApi,
  VIEWER_PERMISSIONS,
  WORKSPACE_ID,
  workspaceAccess,
  workspaceList,
} from '@web/testing/fake-api'
import { NO_PIX, workspaceSettingsAnswer } from '@web/testing/settings-api'
import type { FakeAnswer } from '@web/testing/testing.types'
import { beforeEach, describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'
import { render } from 'vitest-browser-react'

const BASE = `/api/workspaces/${WORKSPACE_ID}`
const PIX_PATH = `/w/${WORKSPACE_ID}/settings/pix`
const BAD_REQUEST = 400
const SERVER_ERROR = 500
const NO_CONTENT = 204
const MEMBER_PERMISSIONS = [...VIEWER_PERMISSIONS, { module: 'settings', action: 'view' }]

async function openPix({
  access = workspaceAccess,
  answers = {},
}: {
  access?: FakeAnswer
  answers?: Record<string, FakeAnswer>
} = {}) {
  fakeApi({
    'GET /api/auth/me': account,
    'GET /api/workspaces': () => workspaceList(),
    [`GET ${BASE}`]: access,
    ...workspaceSettingsAnswer(),
    ...answers,
  })
  const app = createApp(createMemoryHistory({ initialEntries: [PIX_PATH] }))
  await render(<AppProviders app={app} />)
  return app
}

function pixField(label: string) {
  return page.getByRole('textbox', { name: label, exact: true })
}

function pressDisabled(button: Element) {
  if (button instanceof HTMLElement) {
    button.click()
  }
}

function recordPuts(sent: unknown[]): Record<string, FakeAnswer> {
  return {
    [`PUT ${BASE}/settings/pix`]: async (request) => {
      sent.push(await request.json())
      return new Response(null, { status: NO_CONTENT })
    },
  }
}

describe('SET-02 Recebimento por Pix', () => {
  beforeEach(async () => {
    await page.viewport(360, 800)
  })

  it('shows the saved key, the receiver, the city and what the payer’s bank shows', async () => {
    await openPix()
    await expect
      .element(page.getByRole('heading', { name: 'Recebimento por Pix', level: 1 }))
      .toBeVisible()
    await expect
      .element(page.getByRole('link', { name: 'Voltar para Configurações' }))
      .toHaveAttribute('href', `/w/${WORKSPACE_ID}/settings`)
    await expect
      .element(page.getByText(/O Pix que vai nas cobranças do espaço Casa\./))
      .toBeVisible()
    await expect.element(pixField('Chave Pix')).toHaveValue('member.a@exemplo.com')
    await expect.element(pixField('Nome de quem recebe')).toHaveValue('MEMBER A')
    await expect.element(pixField('Cidade')).toHaveValue('SAO PAULO')
    await expect
      .element(page.getByText('Aparece no app do banco de quem paga. Sem acentos fica melhor.'))
      .toBeVisible()
    const preview = page.getByRole('status').filter({ hasText: 'No app do banco' })
    await expect.element(preview.getByText('MEMBER A · SAO PAULO')).toBeVisible()
    await expect
      .element(page.getByRole('button', { name: 'Salvar Pix' }))
      .toHaveAttribute('aria-disabled', 'true')
    await expect.element(page.getByRole('button', { name: 'Remover Pix' })).toBeVisible()
    await expect
      .element(page.getByRole('button', { name: 'Mais' }))
      .toHaveAttribute('aria-current', 'page')
    await expectNoAccessibilityViolations(page.getByRole('main').element())
  })

  it('saves a change, says so and waits for the next change', async () => {
    const sent: unknown[] = []
    await openPix({ answers: recordPuts(sent) })
    const save = page.getByRole('button', { name: 'Salvar Pix' })
    await pixField('Cidade').click()
    await userEvent.tab()
    pressDisabled(save.element())
    const name = pixField('Nome de quem recebe')
    await name.fill('  MEMBER B  ')
    await expect.element(page.getByText('MEMBER B · SAO PAULO')).toBeVisible()
    await expect.element(save).not.toHaveAttribute('aria-disabled')
    await save.click()
    await expect
      .element(page.getByText('Pix salvo. As próximas cobranças já saem com ele.'))
      .toBeVisible()
    expect(sent).toEqual([
      { key: 'member.a@exemplo.com', receiverName: 'MEMBER B', receiverCity: 'SAO PAULO' },
    ])
    await expect.element(save).toHaveAttribute('aria-disabled', 'true')
    pressDisabled(save.element())
    expect(sent).toHaveLength(1)
  })

  it('asks for the three fields when there is no Pix yet and saves them together', async () => {
    const sent: unknown[] = []
    await openPix({ answers: { ...workspaceSettingsAnswer(NO_PIX), ...recordPuts(sent) } })
    await expect.element(pixField('Chave Pix')).toHaveValue('')
    await expect
      .element(pixField('Chave Pix'))
      .toHaveAttribute('placeholder', 'CPF, e-mail, telefone ou aleatória')
    await expect.element(page.getByRole('button', { name: 'Remover Pix' })).not.toBeInTheDocument()
    await expect.element(page.getByText(/No app do banco/)).not.toBeInTheDocument()
    await pixField('Chave Pix').click()
    await userEvent.tab()
    await expect.element(page.getByText('Informe a chave Pix.')).toBeVisible()
    await pixField('Chave Pix').fill('chave-aleatoria')
    await pixField('Nome de quem recebe').fill('MEMBER A')
    await pixField('Cidade').fill('CAMPINAS')
    await page.getByRole('button', { name: 'Salvar Pix' }).click()
    await expect
      .poll(() => sent)
      .toEqual([{ key: 'chave-aleatoria', receiverName: 'MEMBER A', receiverCity: 'CAMPINAS' }])
    await expect.element(page.getByRole('button', { name: 'Remover Pix' })).toBeVisible()
  })

  it('counts the receiver name and the city near their limits', async () => {
    await openPix()
    await expect.element(page.getByText('8/25')).not.toBeInTheDocument()
    await pixField('Nome de quem recebe').fill('MEMBER A DA SILVA SANTOS')
    await expect.element(page.getByText('24/25')).toBeVisible()
    await expect.element(pixField('Nome de quem recebe')).toHaveAttribute('maxlength', '25')
    await pixField('Cidade').fill('SAO JOSE DOS CA')
    await expect.element(page.getByText('15/15')).toBeVisible()
    await expect.element(pixField('Cidade')).toHaveAttribute('maxlength', '15')
  })

  it('removes the Pix after the confirmation', async () => {
    const sent: unknown[] = []
    await openPix({ answers: recordPuts(sent) })
    await page.getByRole('button', { name: 'Remover Pix' }).click()
    const dialog = page.getByRole('alertdialog', { name: 'Remover o Pix?' })
    await expect
      .element(dialog.getByText('As próximas cobranças sairão sem o Pix copia e cola.'))
      .toBeVisible()
    await dialog.getByRole('button', { name: 'Remover Pix' }).click()
    await expect.poll(() => sent).toEqual([null])
    await expect.element(page.getByText('Pix removido.')).toBeVisible()
    await expect.element(pixField('Chave Pix')).toHaveValue('')
    await expect.element(page.getByRole('button', { name: 'Remover Pix' })).not.toBeInTheDocument()
  })

  it('keeps the typed data and shows the code when the API refuses the Pix', async () => {
    await openPix({
      answers: { [`PUT ${BASE}/settings/pix`]: () => apiError('PIX_INVALID', BAD_REQUEST) },
    })
    await pixField('Cidade').fill('CAMPINAS')
    await page.getByRole('button', { name: 'Salvar Pix' }).click()
    await expect
      .element(page.getByRole('alert').getByText('Não foi possível concluir. Código: abcd1234.'))
      .toBeVisible()
    await expect.element(pixField('Cidade')).toHaveValue('CAMPINAS')
  })

  it('shows a member the Pix without changing it', async () => {
    await openPix({ access: () => accessAs('Membro', MEMBER_PERMISSIONS) })
    await expect.element(pixField('Chave Pix')).toHaveAttribute('readonly')
    await expect.element(page.getByText('MEMBER A · SAO PAULO')).toBeVisible()
    await expect.element(page.getByRole('button', { name: 'Salvar Pix' })).not.toBeInTheDocument()
    await expect.element(page.getByRole('button', { name: 'Remover Pix' })).not.toBeInTheDocument()
  })

  it('tells a member when there is no Pix', async () => {
    await openPix({
      access: () => accessAs('Membro', MEMBER_PERMISSIONS),
      answers: workspaceSettingsAnswer(NO_PIX),
    })
    await expect.element(page.getByText('Nenhuma chave Pix cadastrada.')).toBeVisible()
  })

  it('offers a retry when the settings do not load', async () => {
    await openPix({
      answers: { [`GET ${BASE}/settings`]: () => apiError('INTERNAL_ERROR', SERVER_ERROR) },
    })
    await expect.element(page.getByText('Não deu para carregar o Pix.')).toBeVisible()
    await expect.element(page.getByRole('button', { name: 'Tentar de novo' })).toBeVisible()
  })

  it('shows the breadcrumb and the explanation under the title on the desktop', async () => {
    await page.viewport(1280, 900)
    await openPix()
    const crumbs = page.getByRole('navigation', { name: 'Caminho' })
    await expect
      .element(crumbs.getByRole('link', { name: 'Configurações' }))
      .toHaveAttribute('href', `/w/${WORKSPACE_ID}/settings`)
    await expect
      .element(page.getByText(/O Pix que vai nas cobranças do espaço Casa\./))
      .toBeVisible()
    await expect.element(pixField('Chave Pix')).toHaveValue('member.a@exemplo.com')
    await expectNoAccessibilityViolations(page.getByRole('main').element())
  })
})
