import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

/**
 * AlreadyAuthRedirect — renders its children for unauthenticated users;
 * redirects authenticated users to their role's root.
 * Used to wrap login/register routes so authenticated users are not shown
 * auth forms.
 */
export function AlreadyAuthRedirect({ children }: { children: ReactNode }) {
  const { token, role, isLoading } = useAuth()

  if (isLoading) return null
  if (token && role) return <Navigate to={`/${role}`} replace />

  return <>{children}</>
}
