import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import { AuthProvider, useAuth } from '@/hooks/useAuth'
import { Layout } from '@/components/Layout'
import { Login } from '@/pages/Login'
import { Callback } from '@/pages/Callback'
import { Overview } from '@/pages/Overview'
import { Offerings } from '@/pages/Offerings'
import { CapTable } from '@/pages/CapTable'
import { TransferAgent } from '@/pages/TransferAgent'
import { Investors } from '@/pages/Investors'
import { AuditTrail } from '@/pages/AuditTrail'
import { Compliance } from '@/pages/Compliance'
import { LuxMark } from '@/components/Brand'
import { hasSession } from '@/lib/session'

function Protected({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  // Sandbox email/password session bypasses the IAM loading gate — self-contained.
  if (hasSession()) return <>{children}</>
  if (isLoading) {
    return (
      <div className="grid h-full place-items-center">
        <LuxMark size={28} className="animate-pulse text-muted-foreground" />
      </div>
    )
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/callback" element={<Callback />} />
          <Route
            element={
              <Protected>
                <Layout />
              </Protected>
            }
          >
            <Route index element={<Overview />} />
            <Route path="/offerings" element={<Offerings />} />
            <Route path="/cap-table" element={<CapTable />} />
            <Route path="/transfer-agent" element={<TransferAgent />} />
            <Route path="/investors" element={<Investors />} />
            <Route path="/audit" element={<AuditTrail />} />
            <Route path="/compliance" element={<Compliance />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
