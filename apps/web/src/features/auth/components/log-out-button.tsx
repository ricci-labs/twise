import { Button } from '@web/components/actions/button'
import { TextLink } from '@web/components/actions/text-link'
import { useLogOut } from '@web/features/auth/api/use-log-out'
import { authMessages } from '@web/features/auth/auth.messages'
import type { LogOutButtonProps } from '@web/features/auth/auth.types'

export function LogOutButton({ variant = 'button' }: LogOutButtonProps) {
  const logOut = useLogOut()
  if (variant === 'link') {
    return (
      <TextLink render={<button type="button" />} onClick={() => logOut.mutate()}>
        {authMessages.logOut}
      </TextLink>
    )
  }
  return (
    <Button variant="tertiary" isLoading={logOut.isPending} onClick={() => logOut.mutate()}>
      {authMessages.logOut}
    </Button>
  )
}
