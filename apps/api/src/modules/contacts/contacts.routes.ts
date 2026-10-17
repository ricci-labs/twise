import type { AppEnv } from '@api/core/http/http.types'
import { currentSession } from '@api/core/http/middleware/session'
import { jsonBody, pathParams, queryParams } from '@api/core/http/validation'
import { authorize, currentWorkspace } from '@api/modules/access'
import {
  cancelCharge,
  changeContact,
  createCharge,
  createContact,
  deleteContact,
  getCharge,
  getContact,
  listCharges,
  listContactBalances,
  listContacts,
  listOpenItems,
  listUpcomingContactItems,
  markChargeSent,
  optOutByLink,
  payCharge,
  sendChargeEmail,
} from '@api/modules/contacts/contacts.service'
import type { ContactOptOutRouteDeps, ContactRouteDeps } from '@api/modules/contacts/contacts.types'
import { limitInvalidLinks } from '@api/modules/identity'
import {
  chargeListQuerySchema,
  chargeParamsSchema,
  chargePaymentSchema,
  chargeSentSchema,
  contactChangeSchema,
  contactOptOutRequestSchema,
  contactParamsSchema,
  deletionRequestSchema,
  newChargeSchema,
  newContactSchema,
  openItemsQuerySchema,
  upcomingContactItemsQuerySchema,
} from '@financas/shared'
import { Hono } from 'hono'

const CREATED = 201
const NO_CONTENT = 204

export const PUBLIC_CONTACT_ROUTES = ['POST /api/public/contacts/opt-out'] as const

export function contactRoutes({ db }: ContactRouteDeps) {
  const contact = pathParams(contactParamsSchema, 'CONTACT_NOT_FOUND')

  return new Hono<AppEnv>()
    .get('/', authorize('contacts', 'view'), async (c) => {
      return c.json(await listContacts(db, currentWorkspace(c).workspaceId))
    })
    .get('/balances', authorize('contacts', 'view'), async (c) => {
      return c.json(await listContactBalances(db, currentWorkspace(c).workspaceId))
    })
    .get(
      '/upcoming',
      authorize('contacts', 'view'),
      queryParams(upcomingContactItemsQuerySchema, 'UPCOMING_CONTACT_ITEMS_QUERY_INVALID'),
      async (c) => {
        const { workspaceId } = currentWorkspace(c)
        return c.json(await listUpcomingContactItems(db, workspaceId, c.req.valid('query').limit))
      },
    )
    .get('/:contactId', authorize('contacts', 'view'), contact, async (c) => {
      const { workspaceId } = currentWorkspace(c)
      return c.json(await getContact(db, workspaceId, c.req.valid('param').contactId))
    })
    .get(
      '/:contactId/open-items',
      authorize('contacts', 'view'),
      contact,
      queryParams(openItemsQuerySchema, 'OPEN_ITEMS_QUERY_INVALID'),
      async (c) => {
        const { workspaceId } = currentWorkspace(c)
        const { contactId } = c.req.valid('param')
        return c.json(await listOpenItems(db, { workspaceId, contactId }, c.req.valid('query')))
      },
    )
    .post(
      '/',
      authorize('contacts', 'create'),
      jsonBody(newContactSchema, 'CONTACT_INVALID'),
      async (c) => {
        const { workspaceId } = currentWorkspace(c)
        const { userId } = currentSession(c)
        return c.json(
          await createContact(db, { workspaceId, userId }, c.req.valid('json')),
          CREATED,
        )
      },
    )
    .patch(
      '/:contactId',
      authorize('contacts', 'update'),
      contact,
      jsonBody(contactChangeSchema, 'CONTACT_INVALID'),
      async (c) => {
        const { workspaceId } = currentWorkspace(c)
        const { contactId } = c.req.valid('param')
        await changeContact(db, { workspaceId, contactId }, c.req.valid('json'))
        return c.body(null, NO_CONTENT)
      },
    )
    .post(
      '/:contactId/charges',
      authorize('contacts', 'create'),
      contact,
      jsonBody(newChargeSchema, 'CHARGE_INVALID'),
      async (c) => {
        const { workspaceId } = currentWorkspace(c)
        const { userId } = currentSession(c)
        const { contactId } = c.req.valid('param')
        const created = await createCharge(
          db,
          { workspaceId, contactId },
          userId,
          c.req.valid('json'),
        )
        return c.json(created, CREATED)
      },
    )
    .delete(
      '/:contactId',
      authorize('contacts', 'delete'),
      contact,
      jsonBody(deletionRequestSchema, 'DELETION_INVALID'),
      async (c) => {
        const { workspaceId } = currentWorkspace(c)
        const { userId } = currentSession(c)
        const { contactId } = c.req.valid('param')
        await deleteContact(db, {
          workspaceId,
          contactId,
          userId,
          reason: c.req.valid('json').reason,
        })
        return c.body(null, NO_CONTENT)
      },
    )
}

export function chargeRoutes({ db, publicUrl }: ContactRouteDeps) {
  const charge = pathParams(chargeParamsSchema, 'CHARGE_NOT_FOUND')

  return new Hono<AppEnv>()
    .get(
      '/',
      authorize('contacts', 'view'),
      queryParams(chargeListQuerySchema, 'CHARGE_QUERY_INVALID'),
      async (c) => {
        const { workspaceId } = currentWorkspace(c)
        return c.json(await listCharges(db, workspaceId, c.req.valid('query').contactId))
      },
    )
    .get('/:chargeId', authorize('contacts', 'view'), charge, async (c) => {
      const { workspaceId } = currentWorkspace(c)
      return c.json(await getCharge(db, workspaceId, c.req.valid('param').chargeId))
    })
    .post(
      '/:chargeId/sent',
      authorize('contacts', 'update'),
      charge,
      jsonBody(chargeSentSchema, 'CHARGE_SENT_INVALID'),
      async (c) => {
        const { workspaceId } = currentWorkspace(c)
        const { chargeId } = c.req.valid('param')
        await markChargeSent(db, { workspaceId, chargeId }, c.req.valid('json'))
        return c.body(null, NO_CONTENT)
      },
    )
    .post(
      '/:chargeId/payments',
      authorize('contacts', 'update'),
      charge,
      jsonBody(chargePaymentSchema, 'CHARGE_PAYMENT_INVALID'),
      async (c) => {
        const { workspaceId } = currentWorkspace(c)
        const { userId } = currentSession(c)
        const { chargeId } = c.req.valid('param')
        return c.json(
          await payCharge(db, { workspaceId, chargeId }, userId, c.req.valid('json')),
          CREATED,
        )
      },
    )
    .post('/:chargeId/send-email', authorize('contacts', 'update'), charge, async (c) => {
      const { workspaceId } = currentWorkspace(c)
      await sendChargeEmail(db, { workspaceId, chargeId: c.req.valid('param').chargeId }, publicUrl)
      return c.body(null, NO_CONTENT)
    })
    .post('/:chargeId/cancel', authorize('contacts', 'update'), charge, async (c) => {
      const { workspaceId } = currentWorkspace(c)
      await cancelCharge(db, { workspaceId, chargeId: c.req.valid('param').chargeId })
      return c.body(null, NO_CONTENT)
    })
}

export function contactOptOutRoutes(deps: ContactOptOutRouteDeps) {
  return new Hono<AppEnv>().post(
    '/opt-out',
    jsonBody(contactOptOutRequestSchema, 'LINK_INVALID'),
    limitInvalidLinks(deps),
    async (c) => {
      await optOutByLink(deps.db, c.req.valid('json'))
      return c.body(null, NO_CONTENT)
    },
  )
}
