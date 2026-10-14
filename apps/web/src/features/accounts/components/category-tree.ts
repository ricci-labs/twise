import { accountsMessages } from '@web/features/accounts/accounts.messages'
import type {
  ArchivedCategory,
  CategoryKind,
  CategoryNode,
  CategoryTree,
  LedgerAccount,
} from '@web/features/accounts/accounts.types'
import { matchesSearch } from '@web/lib/long-lists'

const messages = accountsMessages.categories
const KIND_OF_ACCOUNT: Readonly<Record<string, CategoryKind>> = {
  expense_category: 'expense',
  income_category: 'income',
}

export function categoryTreeOf(
  accounts: readonly LedgerAccount[],
  kind: CategoryKind,
): CategoryTree {
  const nodes = accounts
    .filter((account) => !account.isSystem && KIND_OF_ACCOUNT[account.kind] === kind)
    .map((account) => nodeOf(account, kind))
  const byId = new Map(nodes.map((node) => [node.id, node]))
  const isActiveMain = (node: CategoryNode) =>
    !node.isArchived && !isActive(byId.get(node.parentId ?? ''))
  const active = nodes
    .filter(isActiveMain)
    .map((main) => ({ ...main, children: childrenOf(main, nodes, false) }))
  const archived = nodes
    .filter((node) => node.isArchived && !byId.get(node.parentId ?? '')?.isArchived)
    .map((node) => archivedOf(node, nodes, byId))
  return { active, archived, archivedCount: nodes.filter((node) => node.isArchived).length }
}

export function activeCategoryCount(
  accounts: readonly LedgerAccount[],
  kind: CategoryKind | undefined,
): number {
  return accounts.filter(
    (account) =>
      isCategory(account) &&
      account.archivedAt === null &&
      (kind === undefined || KIND_OF_ACCOUNT[account.kind] === kind),
  ).length
}

export function categoriesMatching(
  accounts: readonly LedgerAccount[],
  search: string,
): LedgerAccount[] {
  const found = accounts.filter(
    (account) => isCategory(account) && matchesSearch(account.name, search),
  )
  const foundIds = new Set(found.map((account) => account.id))
  const kept = new Set([
    ...foundIds,
    ...found.flatMap((account) => (account.parentId ? [account.parentId] : [])),
    ...accounts
      .filter((account) => account.parentId !== null && foundIds.has(account.parentId))
      .map((account) => account.id),
  ])
  return accounts.filter((account) => !isCategory(account) || kept.has(account.id))
}

export function namesList(names: readonly string[]): string {
  if (names.length <= 1) {
    return names.join('')
  }
  return `${names.slice(0, -1).join(', ')}${messages.and}${names.at(-1)}`
}

export function parentOf(node: CategoryNode, tree: CategoryTree): CategoryNode | undefined {
  return [...tree.active, ...tree.archived].find((candidate) => candidate.id === node.parentId)
}

function isCategory(account: LedgerAccount): boolean {
  return !account.isSystem && KIND_OF_ACCOUNT[account.kind] !== undefined
}

function nodeOf(account: LedgerAccount, kind: CategoryKind): CategoryNode {
  return {
    id: account.id,
    name: account.name,
    icon: account.icon,
    color: account.color,
    kind,
    parentId: account.parentId,
    incomeNature: account.incomeNature,
    isArchived: account.archivedAt !== null,
    children: [],
  }
}

function isActive(node: CategoryNode | undefined): boolean {
  return node !== undefined && !node.isArchived
}

function childrenOf(
  parent: CategoryNode,
  nodes: readonly CategoryNode[],
  isArchived: boolean,
): CategoryNode[] {
  return nodes.filter((node) => node.parentId === parent.id && node.isArchived === isArchived)
}

function archivedOf(
  node: CategoryNode,
  nodes: readonly CategoryNode[],
  byId: ReadonlyMap<string, CategoryNode>,
): ArchivedCategory {
  const parent = byId.get(node.parentId ?? '')
  if (parent) {
    return { ...node, detail: messages.loneChild(parent.name) }
  }
  const children = childrenOf(node, nodes, true)
  const kindName = messages.kindNames[node.kind]
  return {
    ...node,
    children,
    detail: children.length
      ? messages.withChildren(kindName, namesList(children.map((child) => child.name)))
      : kindName,
  }
}
