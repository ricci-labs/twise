import { workspaceChoiceOf } from '@web/features/workspaces/components/workspace-choice'
import type { WorkspaceListItem } from '@web/features/workspaces/workspaces.types'
import { describe, expect, it } from 'vitest'

const ROLE = { roleId: 'role', name: 'Dono', systemKey: 'owner' as const }

function workspace(workspaceId: string, isArchived = false): WorkspaceListItem {
  return { workspaceId, name: workspaceId, isArchived, role: ROLE }
}

describe('workspaceChoiceOf', () => {
  it('opens the workspace used last, if it is still one of theirs', () => {
    expect(workspaceChoiceOf([workspace('a'), workspace('b')], 'b')).toEqual({
      kind: 'open',
      workspaceId: 'b',
    })
  })

  it('opens the only workspace, even without a last one', () => {
    expect(workspaceChoiceOf([workspace('a')], 'gone')).toEqual({ kind: 'open', workspaceId: 'a' })
  })

  it('asks to pick among several, and to create the first when there is none', () => {
    expect(workspaceChoiceOf([workspace('a'), workspace('b')], null)).toEqual({ kind: 'pick' })
    expect(workspaceChoiceOf([], null)).toEqual({ kind: 'create' })
  })

  it('never opens an archived workspace', () => {
    expect(workspaceChoiceOf([workspace('a', true)], 'a')).toEqual({ kind: 'create' })
  })
})
