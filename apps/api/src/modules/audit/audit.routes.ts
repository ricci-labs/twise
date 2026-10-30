import type { AppEnv } from '@api/core/http/http.types'
import { queryParams } from '@api/core/http/validation'
import { authorize, currentWorkspace } from '@api/modules/access'
import { listAuditEvents } from '@api/modules/audit/audit.service'
import type { AuditRouteDeps } from '@api/modules/audit/audit.types'
import { auditQuerySchema } from '@financas/shared'
import { Hono } from 'hono'

export function auditRoutes({ db, names }: AuditRouteDeps) {
  return new Hono<AppEnv>().get(
    '/',
    authorize('audit', 'view'),
    queryParams(auditQuerySchema, 'AUDIT_QUERY_INVALID'),
    async (c) => {
      const { workspaceId } = currentWorkspace(c)
      return c.json(await listAuditEvents(db, names, workspaceId, c.req.valid('query')))
    },
  )
}
