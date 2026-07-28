// Native Hanzo IAM (lux.id) — OIDC + PKCE via @hanzo/iam. Discovery/token/
// userinfo resolve through bankd's transparent /v1/iam proxy at
// api.lux.financial so there is no hand-rolled OAuth and no cross-origin
// surprises (proxy is CORS `*`). The issuer console is the `lux-issuer` IAM
// client (org `lux`). The primary demo path is the sandbox email+password gate
// (see lib/session); Lux ID is the production identity path.
import type { IAMConfig } from '@hanzo/iam/browser'

const API_BASE = (import.meta.env.VITE_BANK_API_URL as string) || 'https://api.lux.financial'
const origin = typeof window !== 'undefined' ? window.location.origin : 'https://issuer.lux.financial'

export const IAM_CONFIG: IAMConfig = {
  serverUrl: `${API_BASE}/v1/iam`,
  clientId: 'lux-issuer',
  redirectUri: `${origin}/callback`,
  scope: 'openid profile email',
  proxyBaseUrl: API_BASE,
}

// The SDK stores the access token under this key (sessionStorage by default).
export const IAM_TOKEN_KEY = 'hanzo_iam_access_token'
