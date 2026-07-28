// Auth is native Hanzo IAM (lux.id) via OIDC + PKCE (@hanzo/iam). Thin shim over
// the IAM React context. The sandbox email/password gate (lib/session) is the
// primary demo path and short-circuits this in the Protected route.
import { createElement, type ReactNode } from 'react'
import { IamProvider, useIam } from '@hanzo/iam/react'
import { IAM_CONFIG } from '@/lib/iam'

export function AuthProvider({ children }: { children: ReactNode }) {
  return createElement(IamProvider, { config: IAM_CONFIG, children })
}

export function useAuth() {
  const iam = useIam()
  return {
    token: iam.accessToken,
    user: iam.user as Record<string, unknown> | null,
    isAuthenticated: iam.isAuthenticated,
    isLoading: iam.isLoading,
    login: () => iam.login(),
    logout: iam.logout,
    handleCallback: iam.handleCallback,
  }
}
