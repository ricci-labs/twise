import { Link } from '@tanstack/react-router'
import { Button } from '@web/components/actions/button'
import { AuditChange } from '@web/components/display/audit-change'
import { Sheet } from '@web/components/layout/sheet'
import { auditMessages as messages } from '@web/features/audit/audit.messages'
import type { AuditChangeSheetProps } from '@web/features/audit/audit.types'
import {
  auditChangeDetailOf,
  auditChangeRowsOf,
  auditTitleOf,
  canOpenItem,
  referenceOf,
} from '@web/features/audit/components/audit-views'

export function AuditChangeSheet({ workspaceId, event, today, onClose }: AuditChangeSheetProps) {
  return (
    <Sheet
      title={messages.change.title}
      closeLabel={messages.change.close}
      isOpen
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onClose()
        }
      }}
    >
      <div className="flex flex-col gap-5">
        <AuditChange
          actorName={event.actor?.name ?? null}
          title={auditTitleOf(event)}
          detail={auditChangeDetailOf(event, today)}
          rows={auditChangeRowsOf(event)}
          reference={referenceOf(event)}
        />
        <div className="grid grid-cols-2 gap-3">
          <Button variant="tertiary" onClick={onClose}>
            {messages.change.close}
          </Button>
          {canOpenItem(event) && (
            <Button
              render={
                <Link
                  to="/w/$workspaceId/entries/$entry"
                  params={{ workspaceId, entry: event.rowId }}
                />
              }
            >
              {messages.change.openEntry}
            </Button>
          )}
        </div>
      </div>
    </Sheet>
  )
}
