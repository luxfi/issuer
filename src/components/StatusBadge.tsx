import { Badge } from './ui'
import { titleCase } from '@/lib/format'

// Maps a securities status string to a toned pill. Covers offering / investor /
// transfer / compliance / restriction vocabularies for the issuer console.
const tone: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'muted' | 'neutral'> = {
  // positive / cleared
  active: 'success', live: 'success', open: 'success', funded: 'success', settled: 'success',
  cleared: 'success', accredited: 'success', accepted: 'success', filed: 'success', effective: 'success',
  approved: 'success', completed: 'success', clear: 'success', unrestricted: 'success', vested: 'success',
  // in-flight / attention
  pending: 'warning', review: 'warning', in_review: 'warning', processing: 'info', closing_soon: 'warning',
  upcoming: 'info', draft: 'muted', unlocking: 'info', partial: 'warning', qualified: 'info',
  restricted: 'info', locked: 'info', escrow: 'info', vesting: 'info', rotating: 'info',
  // negative
  failed: 'danger', rejected: 'danger', flagged: 'danger', overdue: 'danger', expired: 'danger',
  suspended: 'danger', revoked: 'danger', high: 'danger', non_accredited: 'warning',
  // muted / terminal
  closed: 'muted', cancelled: 'muted', exempt: 'muted', not_started: 'muted', low: 'success', medium: 'warning',
}

export function StatusBadge({ status, dot = true }: { status: string; dot?: boolean }) {
  const t = tone[status] ?? 'neutral'
  return (
    <Badge tone={t} dot={dot}>
      {titleCase(status)}
    </Badge>
  )
}
