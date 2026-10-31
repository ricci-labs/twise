export type AuditChangeRow = {
  label: string
  before: string
  after: string
  isChanged: boolean
}

export type AuditChangeProps = {
  actorName: string | null
  title: string
  detail: string
  rows: readonly AuditChangeRow[]
  reference: string | null
}

export type AuditChangeNoteProps = Pick<AuditChangeProps, 'reference'> & {
  hasChanges: boolean
}
