import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

interface AlreadyAuthRedirectProps {
  children: ReactNode
  pageRole?: 'customer' | 'provider' | 'admin'
}

export function AlreadyAuthRedirect({ children, pageRole }: AlreadyAuthRedirectProps) {
  const { token, role, isLoading } = useAuth()

  if (isLoading) return null

  if (token && role) {
    if (!pageRole || pageRole === role) {
      return <Navigate to={`/${role}`} replace />
    }
  }

  return <>{children}</>
}
