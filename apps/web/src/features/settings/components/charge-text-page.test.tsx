import { createMemoryHistory } from '@tanstack/react-router'
import { AppProviders } from '@web/app/providers'
import { createApp } from '@web/app/router'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import {
  accessAs,
  account,
  fakeApi,
  VIEWER_PERMISSIONS,
  WORKSPACE_ID,
  workspaceAccess,
  workspaceList,
} from '@web/testing/fake-api'
import {
  chargeTextAnswer,
  DEFAULT_TEXT,
  NO_PIX,
  WORKSPACE_TEXT,
  workspaceSettingsAnswer,
} from '@web/testing/settings-api'
import type { FakeAnswer } from '@web/testing/testing.types'
import { beforeEach, describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'
import { render } from 'vitest-browser-react'

const BASE = `/api/workspaces/${WORKSPACE_ID}`
const TEXT_PATH = `/w/${WORKSPACE_ID}/settings/charge-text`
const NO_CONTENT = 204
const MEMBER_PERMISSIONS = [...VIEWER_PERMISSIONS, { module: 'settings', action: 'view' }]

async function openChargeText({
  access = workspaceAccess,
  text = DEFAULT_TEXT,
  answers = {},
}: {
  access?: FakeAnswer
  text?: Readonly<Record<string, string | boolean | null>>
  answers?: Record<string, FakeAnswer>
} = {}) {
  fakeApi({
    'GET /api/auth/me': account,
    'GET /api/workspaces': () => workspaceList(),
    [`GET ${BASE}`]: access,
    ...workspaceSettingsAnswer(),
    ...chargeTextAnswer(text),
    ...answers,
  })
  const app = createApp(createMemoryHistory({ initialEntries: [TEXT_PATH] }))
  await render(<AppProviders app={app} />)
  return app
}

function textField(label: string) {
  return page.getByRole('textbox', { name: label, exact: true })
}

function saveButton() {
  return page.getByRole('button', { name: 'Salvar texto' })
}

describe('SET-03 Mensagem das cobranças', () => {
  beforeEach(async () => {
    await page.viewport(360, 800)
  })

  it('shows the text with its tags and how the e-mail lands in the inbox', async () => {
    await openChargeText()
    await expect
      .element(page.getByRole('heading', { name: 'Mensagem das cobranças', level: 1 }))
      .toBeVisible()
    await expect
      .element(page.getByRole('link', { name: 'Voltar para Configurações' }))
      .toHaveAttribute('href', `/w/${WORKSPACE_ID}/settings`)
    await expect
      .element(page.getByText(/O texto que vai nas cobranças do espaço Casa/))
      .toBeVisible()
    await expect.element(textField('Assunto do e-mail')).toHaveValue(DEFAULT_TEXT.subject)
    await expect.element(textField('Abertura')).toHaveValue(DEFAULT_TEXT.opening)
    await expect
      .element(textField('Encerramento'))
      .toHaveValue('Qualquer dúvida, é só responder este e-mail.')
    const preview = page.getByRole('region', { name: 'Como fica, com uma cobrança de exemplo' })
    await expect.element(preview.getByText('Twise · Casa')).toBeVisible()
    await expect
      .element(preview.getByText(/^Member A te enviou uma cobrança de R\$\s200,00$/))
      .toBeVisible()
    await expect
      .element(preview.getByText(/^Oi, Ana! Member A pediu para te lembrar/))
      .toBeVisible()
    await expect.element(page.getByText('Sempre vão na cobrança, do jeito que estão')).toBeVisible()
    await expect
      .element(page.getByRole('button', { name: 'Voltar ao texto padrão' }))
      .not.toBeInTheDocument()
    await expect.element(saveButton()).toHaveAttribute('aria-disabled', 'true')
    await expectNoAccessibilityViolations(page.getByRole('main').element())
  })

  it('shows the whole WhatsApp message, without the e-mail sentence by default', async () => {
    await openChargeText()
    await page.getByRole('button', { name: 'WhatsApp' }).click()
    const preview = page.getByRole('region', { name: 'Como fica, com uma cobrança de exemplo' })
    await expect.element(preview.getByText(/Mercado da semana — R\$\s120,00/)).toBeVisible()
    await expect.element(preview.getByText(/Total: R\$\s200,00/)).toBeVisible()
    await expect.element(preview.getByText('Vencimento: 20/10/2026')).toBeVisible()
    await expect.element(preview.getByText('Pix copia e cola:')).toBeVisible()
    await expect
      .element(preview.getByText('Qualquer dúvida, é só responder este e-mail.'))
      .not.toBeInTheDocument()
  })

  it('marks an unknown tag and keeps "Salvar texto" stopped until it is fixed', async () => {
    await openChargeText()
    const opening = textField('Abertura')
    await opening.fill(`${DEFAULT_TEXT.opening} {apelido}`)
    await expect
      .element(
        page.getByText('Esta informação não existe: {apelido}. Use os botões abaixo para inserir.'),
      )
      .toBeVisible()
    await expect.element(saveButton()).toHaveAttribute('aria-disabled', 'true')
    await opening.fill(DEFAULT_TEXT.opening)
    await expect.element(page.getByText(/Esta informação não existe/)).not.toBeInTheDocument()
  })

  it('inserts a tag where the caret is and saves the text, keeping the default closing', async () => {
    const sent: unknown[] = []
    await openChargeText({
      answers: {
        [`PUT ${BASE}/settings/charge-text`]: async (request) => {
          const body = (await request.json()) as Record<string, unknown>
          sent.push(body)
          return Response.json({ ...body, isDefault: false })
        },
      },
    })
    const opening = textField('Abertura')
    await opening.fill('Oi! Aqui é .')
    const element = opening.element()
    if (element instanceof HTMLTextAreaElement) {
      element.setSelectionRange(11, 11)
    }
    await page.getByRole('button', { name: 'Quem cobra' }).click()
    await expect.element(opening).toHaveValue('Oi! Aqui é {quem cobra}.')
    await expect.element(page.getByText(/^Oi, Ana! Oi! Aqui é Member A\.$/)).toBeVisible()
    await saveButton().click()
    await expect
      .element(page.getByText('Texto salvo. As próximas cobranças já saem com ele.'))
      .toBeVisible()
    expect(sent).toEqual([
      { subject: DEFAULT_TEXT.subject, opening: 'Oi! Aqui é {quem cobra}.', closing: null },
    ])
    await expect.element(page.getByRole('button', { name: 'Voltar ao texto padrão' })).toBeVisible()
  })

  it('goes back to the default text after confirming', async () => {
    let text: Readonly<Record<string, string | boolean | null>> = WORKSPACE_TEXT
    await openChargeText({
      text: WORKSPACE_TEXT,
      answers: {
        [`GET ${BASE}/settings/charge-text`]: () => Response.json(text),
        [`DELETE ${BASE}/settings/charge-text`]: () => {
          text = DEFAULT_TEXT
          return new Response(null, { status: NO_CONTENT })
        },
      },
    })
    await expect.element(textField('Encerramento')).toHaveValue('Qualquer coisa me chama.')
    await page.getByRole('button', { name: 'Voltar ao texto padrão' }).click()
    await page.getByRole('button', { name: 'Voltar ao padrão' }).click()
    await expect.element(page.getByText('O texto voltou ao padrão.')).toBeVisible()
    await expect.element(textField('Abertura')).toHaveValue(DEFAULT_TEXT.opening)
  })

  it('leaves the Pix out of the example when the workspace has none', async () => {
    await openChargeText({ answers: workspaceSettingsAnswer(NO_PIX) })
    await expect
      .element(page.getByText('Oi, Ana! Member A pediu para te lembrar do que está em aberto.'))
      .toBeVisible()
    await page.getByRole('button', { name: 'WhatsApp' }).click()
    await expect.element(page.getByText(/Total: R\$\s200,00/)).toBeVisible()
    await expect.element(page.getByText('Pix copia e cola:')).not.toBeInTheDocument()
  })

  it('shows a member who cannot change settings the text, read only', async () => {
    await openChargeText({ access: () => accessAs('Membro', MEMBER_PERMISSIONS) })
    await expect.element(textField('Abertura')).toHaveAttribute('readonly')
    await expect.element(page.getByRole('button', { name: 'Quem cobra' })).not.toBeInTheDocument()
    await expect.element(saveButton()).not.toBeInTheDocument()
    await expect.element(page.getByText('obrigatório')).not.toBeInTheDocument()
  })

  it('puts the fields beside the whole e-mail on the desktop', async () => {
    await page.viewport(1280, 900)
    await openChargeText()
    await expect
      .element(page.getByRole('navigation', { name: 'Caminho' }).getByRole('link'))
      .toHaveAttribute('href', `/w/${WORKSPACE_ID}/settings`)
    await expect.element(page.getByRole('heading', { name: 'Como fica no e-mail' })).toBeVisible()
    await expect
      .element(page.getByRole('article', { name: 'O e-mail como ele chega' }))
      .toBeVisible()
    await expect.element(page.getByRole('region', { name: 'Como fica no WhatsApp' })).toBeVisible()
    await textField('Encerramento').fill('Até mais!')
    await expect
      .element(
        page.getByRole('article', { name: 'O e-mail como ele chega' }).getByText('Até mais!'),
      )
      .toBeVisible()
    await expect.element(saveButton()).not.toHaveAttribute('aria-disabled')
    await expectNoAccessibilityViolations(page.getByRole('main').element())
    await userEvent.keyboard('{Escape}')
  })
})
