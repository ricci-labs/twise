import { auditChangeMessages as messages } from '@web/components/display/audit-change/audit-change.messages'
import type {
  AuditChangeNoteProps,
  AuditChangeProps,
} from '@web/components/display/audit-change/audit-change.types'
import {
  auditChangeCellVariants,
  auditChangeDetailVariants,
  auditChangeFieldVariants,
  auditChangeHeadVariants,
  auditChangeNoteVariants,
  auditChangeRowVariants,
  auditChangeTableVariants,
  auditChangeTitleVariants,
  auditChangeVariants,
  auditChangeWhoTextVariants,
  auditChangeWhoVariants,
} from '@web/components/display/audit-change/audit-change.variants'
import { AuditActorMark } from '@web/components/display/audit-event-row'
import { MetaLine } from '@web/components/display/meta-line'

export function AuditChange({ actorName, title, detail, rows, reference }: AuditChangeProps) {
  return (
    <div data-slot="audit-change" className={auditChangeVariants()}>
      <div className={auditChangeWhoVariants()}>
        <AuditActorMark actorName={actorName} />
        <div className={auditChangeWhoTextVariants()}>
          <strong className={auditChangeTitleVariants()}>{title}</strong>
          <span className={auditChangeDetailVariants()}>
            <MetaLine text={detail} />
          </span>
        </div>
      </div>
      {rows.length > 0 && (
        <table className={auditChangeTableVariants()}>
          <thead>
            <tr>
              <th scope="col" className={auditChangeHeadVariants()}>
                {messages.field}
              </th>
              <th scope="col" className={auditChangeHeadVariants()}>
                {messages.before}
              </th>
              <th scope="col" className={auditChangeHeadVariants()}>
                {messages.after}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.label}
                data-changed={row.isChanged ? '' : undefined}
                className={auditChangeRowVariants({ isChanged: row.isChanged })}
              >
                <th scope="row" className={auditChangeFieldVariants()}>
                  {row.label}
                  {row.isChanged && <span className="sr-only"> {messages.changed}</span>}
                </th>
                <td className={auditChangeCellVariants()}>{row.before}</td>
                <td className={auditChangeCellVariants()}>{row.after}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <AuditChangeNote reference={reference} hasChanges={rows.some((row) => row.isChanged)} />
    </div>
  )
}

function AuditChangeNote({ reference, hasChanges }: AuditChangeNoteProps) {
  if (!(hasChanges || reference)) {
    return null
  }
  return (
    <p className={auditChangeNoteVariants()}>
      {hasChanges && messages.marked}
      {hasChanges && reference && ' '}
      {reference && (
        <>
          {messages.reference} <strong>{reference}</strong>
          {messages.help}
        </>
      )}
    </p>
  )
}
