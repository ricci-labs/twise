import { useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  AccountAction,
  AccountActionRequest,
  AccountParam,
} from '@web/features/accounts/accounts.types'
import { unwrapEmpty } from '@web/lib/api/unwrap'
import { apiClient } from '@web/lib/api-client'
import { queryKeys } from '@web/lib/query-keys'

const accountApi = apiClient.api.workspaces[':workspaceId'].accounts[':accountId']

const REQUESTS: Readonly<Record<AccountAction, (param: AccountParam) => Promise<void>>> = {
  archive: (param) => unwrapEmpty(accountApi.archive.$post(param)),
  unarchive: (param) => unwrapEmpty(accountApi.unarchive.$post(param)),
  delete: (param) => unwrapEmpty(accountApi.$delete({ ...param, json: {} })),
  restore: (param) => unwrapEmpty(accountApi.restore.$post(param)),
}

export function useAccountAction(workspaceId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ action, accountId }: AccountActionRequest) =>
      REQUESTS[action]({ param: { workspaceId, accountId } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.workspace(workspaceId) }),
  })
}
