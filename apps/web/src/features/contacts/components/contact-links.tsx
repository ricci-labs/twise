import { Link } from '@tanstack/react-router'

export function contactLink(workspaceId: string, contactId: string) {
  return (
    <Link to="/w/$workspaceId/contacts/$contact" params={{ workspaceId, contact: contactId }} />
  )
}

export function newContactLink() {
  return <Link to="." search={(previous) => ({ ...previous, contact: 'new' })} />
}
