import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export function AlreadyAuthRedirect({ children }: { children: ReactNode }) {
  const { token, role, isLoading } = useAuth()

  if (isLoading) return null
  if (token && role) return <Navigate to={`/${role}`} replace />

  return <>{children}</>
}
