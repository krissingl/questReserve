import type { ComponentProps, MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

type CrossRoleLinkProps = ComponentProps<typeof Link>

export function CrossRoleLink({ onClick, ...props }: CrossRoleLinkProps) {
  const { clearSession } = useAuth()

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    clearSession()
    onClick?.(e)
  }

  return <Link onClick={handleClick} {...props} />
}
