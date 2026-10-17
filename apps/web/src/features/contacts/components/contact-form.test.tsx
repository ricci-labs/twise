import type { Permission } from '@financas/shared'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@web/components/feedback/toast'
import { ContactEditor } from '@web/features/contacts/components/contact-editor'
import { createQueryClient } from '@web/lib/query-client'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import {
  apiError,
  fakeApi,
  OWNER_PERMISSIONS,
  VIEWER_PERMISSIONS,
  WORKSPACE_ID,
} from '@web/testing/fake-api'
import type { FakeAnswer } from '@web/testing/testing.types'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { page, userEvent } from 'vitest/browser'
import { render } from 'vitest-browser-react'

const BASE = `/api/workspaces/${WORKSPACE_ID}`
const CONTACT_ID = '00000000-0000-4000-8000-0000000000d1'
const NEW_CONTACT_ID = '00000000-0000-4000-8000-0000000000d2'
const CONTACT = {
  id: CONTACT_ID,
  name: 'Member D',
  phoneE164: '+5511999990004',
  email: 'member.d@exemplo.com',
  pixKey: 'member.d@exemplo.com',
  notes: 'Divide a TV da sala.',
  isOptedOut: false,
  isArchived: false,
}

async function openForm({
  param = 'new',
  permissions = OWNER_PERMISSIONS,
  answers = {},
}: {
  param?: string
  permissions?: readonly { module: string; action: string }[]
  answers?: Record<string, FakeAnswer>
} = {}) {
  fakeApi({ [`GET ${BASE}/contacts/${CONTACT_ID}`]: () => Response.json(CONTACT), ...answers })
  const onClose = vi.fn()
  const onCreated = vi.fn()
  const queryClient = createQueryClient({
    onSessionRequired: () => undefined,
    onPermissionDenied: () => undefined,
  })
  await render(
    <QueryClientProvider client={queryClient}>
      <ContactEditor
        workspaceId={WORKSPACE_ID}
        permissions={permissions as readonly Permission[]}
        param={param}
        onClose={onClose}
        onCreated={onCreated}
      />
      <Toaster />
    </QueryClientProvider>,
  )
  return { onClose, onCreated }
}

describe('CON-05 contact form', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('creates a contact with every channel and hands back its id', async () => {
    const sent: unknown[] = []
    const { onCreated } = await openForm({
      answers: {
        [`POST ${BASE}/contacts`]: async (request) => {
          sent.push(await request.json())
          return Response.json({ contactId: NEW_CONTACT_ID }, { status: 201 })
        },
      },
    })
    await expect.element(page.getByRole('dialog', { name: 'Novo contato' })).toBeVisible()
    await expect.element(page.getByLabelText(/^Nome/)).toHaveFocus()
    await expect.element(page.getByRole('switch')).not.toBeInTheDocument()

    await page.getByLabelText(/^Nome/).fill('Member D')
    await page.getByLabelText('WhatsApp').fill('11999990004')
    await page.getByLabelText('E-mail').fill(' member.d@exemplo.com ')
    await page.getByLabelText('Chave Pix').fill('member.d@exemplo.com')
    await page.getByLabelText('Observações').fill('Divide a TV da sala.')
    await page.getByRole('button', { name: 'Criar contato' }).click()

    await expect.element(page.getByText('Contato criado.')).toBeVisible()
    expect(sent).toEqual([
      {
        name: 'Member D',
        phoneE164: '+5511999990004',
        email: 'member.d@exemplo.com',
        pixKey: 'member.d@exemplo.com',
        notes: 'Divide a TV da sala.',
      },
    ])
    expect(onCreated).toHaveBeenCalledWith(NEW_CONTACT_ID)
  })

  it('needs only the name and sends the empty channels as nothing', async () => {
    const sent: unknown[] = []
    await openForm({
      answers: {
        [`POST ${BASE}/contacts`]: async (request) => {
          sent.push(await request.json())
          return Response.json({ contactId: NEW_CONTACT_ID }, { status: 201 })
        },
      },
    })
    await page.getByLabelText(/^Nome/).fill('Member E')
    await page.getByRole('button', { name: 'Criar contato' }).click()

    await expect.element(page.getByText('Contato criado.')).toBeVisible()
    expect(sent).toEqual([
      { name: 'Member E', phoneE164: null, email: null, pixKey: null, notes: null },
    ])
  })

  it('shows each field error when leaving the field', async () => {
    await openForm()
    await page.getByLabelText(/^Nome/).click()
    await userEvent.tab()
    await expect.element(page.getByText('Informe o nome do contato.')).toBeVisible()

    await page.getByLabelText('WhatsApp').fill('99999-0000')
    await userEvent.tab()
    await expect
      .element(page.getByText('Informe o número com DDD, como (11) 99999-0000.'))
      .toBeVisible()
    await expect.element(page.getByLabelText('WhatsApp')).toHaveAttribute('aria-invalid', 'true')

    await page.getByLabelText('E-mail').fill('member.d@exemplo')
    await userEvent.tab()
    await expect
      .element(page.getByText('Informe um e-mail válido, como nome@exemplo.com.'))
      .toBeVisible()
  })

  it('checks the number again when the country changes', async () => {
    await openForm()
    await page.getByLabelText('WhatsApp').fill('912345678')
    await userEvent.tab()
    await expect
      .element(page.getByText('Informe o número com DDD, como (11) 99999-0000.'))
      .toBeVisible()

    await page.getByRole('button', { name: 'País: +55' }).click()
    await page.getByRole('button', { name: 'Portugal (+351)' }).click()

    await expect
      .element(page.getByText('Informe o número com DDD, como (11) 99999-0000.'))
      .not.toBeInTheDocument()
  })

  it('puts a number or e-mail another contact uses under its field', async () => {
    await openForm({
      answers: { [`POST ${BASE}/contacts`]: () => apiError('CONTACT_PHONE_TAKEN', 409) },
    })
    await page.getByLabelText(/^Nome/).fill('Member D')
    await page.getByLabelText('WhatsApp').fill('(11) 99999-0004')
    await page.getByRole('button', { name: 'Criar contato' }).click()

    await expect.element(page.getByText('Outro contato já usa esse número.')).toBeVisible()
    await expect.element(page.getByLabelText('WhatsApp')).toHaveAttribute('aria-invalid', 'true')
    await expect
      .element(page.getByRole('button', { name: 'Criar contato' }))
      .not.toHaveAttribute('aria-disabled', 'true')
  })

  it('puts an e-mail another contact uses under the e-mail', async () => {
    await openForm({
      answers: { [`POST ${BASE}/contacts`]: () => apiError('CONTACT_EMAIL_TAKEN', 409) },
    })
    await page.getByLabelText(/^Nome/).fill('Member D')
    await page.getByLabelText('E-mail').fill('member.d@exemplo.com')
    await page.getByRole('button', { name: 'Criar contato' }).click()

    await expect.element(page.getByText('Outro contato já usa esse e-mail.')).toBeVisible()
    await expect.element(page.getByLabelText('E-mail')).toHaveAttribute('aria-invalid', 'true')
  })

  it('edits only what changed, the opt-out included, once something changed', async () => {
    const sent: unknown[] = []
    const { onClose } = await openForm({
      param: CONTACT_ID,
      answers: {
        [`PATCH ${BASE}/contacts/${CONTACT_ID}`]: async (request) => {
          sent.push(await request.json())
          return new Response(null, { status: 204 })
        },
      },
    })
    await expect.element(page.getByRole('dialog', { name: 'Editar contato' })).toBeVisible()
    await expect.element(page.getByLabelText('WhatsApp')).toHaveValue('(11) 99999-0004')
    await expect
      .element(page.getByRole('button', { name: 'Salvar' }))
      .toHaveAttribute('aria-disabled', 'true')

    await page.getByLabelText('E-mail').fill('')
    await page.getByRole('switch', { name: 'Não quer receber mensagens' }).click()
    await page.getByRole('button', { name: 'Salvar' }).click()

    await expect.element(page.getByText('Alterações salvas.')).toBeVisible()
    expect(sent).toEqual([{ email: null, isOptedOut: true }])
    expect(onClose).toHaveBeenCalled()
  })

  it('says when the contact no longer exists', async () => {
    await openForm({
      param: CONTACT_ID,
      answers: {
        [`PATCH ${BASE}/contacts/${CONTACT_ID}`]: () => apiError('CONTACT_NOT_FOUND', 404),
      },
    })
    await page.getByLabelText(/^Nome/).fill('Member F')
    await page.getByRole('button', { name: 'Salvar' }).click()

    await expect.element(page.getByRole('alert')).toHaveTextContent('Este contato não existe mais.')
  })

  it('does not open for a viewer', async () => {
    await openForm({ permissions: VIEWER_PERMISSIONS })

    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    await openForm({ param: CONTACT_ID })
    const dialog = page.getByRole('dialog', { name: 'Editar contato' })
    await expect.element(dialog).toBeVisible()

    await expectNoAccessibilityViolations(dialog.element())
  })
})
