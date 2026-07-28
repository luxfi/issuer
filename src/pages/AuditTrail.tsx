import { useMemo, useState } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { Card, CardHeader, Table, THead, TH, TBody, TR, TD, Badge, Skeleton, Segmented, Stat } from '@/components/ui'
import { Drawer, DetailRow, Section } from '@/components/Drawer'
import { Icon } from '@/components/icons'
import { useAsync } from '@/hooks/useAsync'
import { getAuditTrail } from '@/lib/data'
import { chainHash, GENESIS_HASH } from '@/lib/hash'
import { formatDate, formatNumber, titleCase } from '@/lib/format'
import type { AuditEvent } from '@/lib/types'

type Cat = 'all' | AuditEvent['category']

const catTone: Record<AuditEvent['category'], 'success' | 'warning' | 'info' | 'muted' | 'neutral'> = {
  offering: 'info',
  cap_table: 'neutral',
  transfer: 'warning',
  investor: 'success',
  compliance: 'info',
  distribution: 'success',
}

// Recompute the hash chain to prove tamper-evidence: every event's hash must
// equal FNV1a(prevHash | canonical(event)) and prevHash must match the prior
// event's hash. Any edit to an earlier row breaks every hash after it.
function verifyChain(events: AuditEvent[]): { ok: boolean; brokenAt: number | null } {
  let prev = GENESIS_HASH
  for (const e of events) {
    const payload = `${e.seq}|${e.ts}|${e.actor}|${e.action}|${e.target}|${e.detail}`
    const expected = chainHash(prev, payload)
    if (e.prevHash !== prev || e.hash !== expected) return { ok: false, brokenAt: e.seq }
    prev = e.hash
  }
  return { ok: true, brokenAt: null }
}

export function AuditTrail() {
  const { data, loading } = useAsync(getAuditTrail)
  const [cat, setCat] = useState<Cat>('all')
  const [sel, setSel] = useState<AuditEvent | null>(null)
  const events = data ?? []

  const chain = useMemo(() => verifyChain(events), [events])
  const rows = useMemo(
    () => (cat === 'all' ? events : events.filter((e) => e.category === cat)).slice().reverse(),
    [events, cat],
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Trail"
        desc="Immutable, append-only event log. Every issuance, transfer, approval and filing is recorded with actor, timestamp and a chained content hash."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[104px]" />)
        ) : (
          <>
            <Stat label="Events" value={formatNumber(events.length)} icon="history" />
            <Stat label="Latest sequence" value={`#${events.length ? events[events.length - 1].seq : 0}`} icon="hash" />
            <Stat label="Chain integrity" value={chain.ok ? 'Verified' : 'Broken'} icon="fingerprint" hint={chain.ok ? 'FNV-1a hash chain' : `at #${chain.brokenAt}`} />
            <Stat label="Genesis" value={<span className="font-mono text-sm">{GENESIS_HASH.slice(0, 8)}…</span>} icon="lock" />
          </>
        )}
      </div>

      <div
        className={
          chain.ok
            ? 'flex items-start gap-2 rounded-lg border border-success/25 bg-success/[0.06] px-4 py-2.5 text-xs text-success'
            : 'flex items-start gap-2 rounded-lg border border-destructive/25 bg-destructive/[0.06] px-4 py-2.5 text-xs text-destructive'
        }
      >
        <Icon name={chain.ok ? 'check' : 'alert'} size={14} className="mt-0.5 shrink-0" />
        <p>
          <span className="font-semibold">{chain.ok ? 'Hash chain verified.' : 'Hash chain broken.'}</span>{' '}
          <span className={chain.ok ? 'text-success/80' : 'text-destructive/80'}>
            {chain.ok
              ? `${events.length} events recomputed from genesis; every hash matches its predecessor.`
              : `Integrity check failed at sequence #${chain.brokenAt}.`}
          </span>
        </p>
      </div>

      <Card>
        <CardHeader
          title="Event log"
          desc="Newest first"
          action={
            <Segmented
              value={cat}
              onChange={setCat}
              options={[
                { label: 'All', value: 'all' },
                { label: 'Offering', value: 'offering' },
                { label: 'Transfer', value: 'transfer' },
                { label: 'Investor', value: 'investor' },
                { label: 'Compliance', value: 'compliance' },
              ]}
            />
          }
        />
        {loading ? (
          <div className="space-y-2 p-4">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
        ) : (
          <Table>
            <THead>
              <TH className="text-right">#</TH>
              <TH>Action</TH>
              <TH>Category</TH>
              <TH>Target</TH>
              <TH>Actor</TH>
              <TH>Hash</TH>
              <TH className="text-right">Timestamp</TH>
            </THead>
            <TBody>
              {rows.map((e) => (
                <TR key={e.seq} onClick={() => setSel(e)}>
                  <TD className="text-right tabular-nums text-muted-foreground">{e.seq}</TD>
                  <TD className="font-medium">{e.action}</TD>
                  <TD>
                    <Badge tone={catTone[e.category]}>{titleCase(e.category)}</Badge>
                  </TD>
                  <TD className="text-muted-foreground">{e.target}</TD>
                  <TD className="text-muted-foreground">{e.actor}</TD>
                  <TD className="font-mono text-xs text-muted-foreground">{e.hash.slice(0, 10)}…</TD>
                  <TD className="text-right text-muted-foreground">{formatDate(e.ts)}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </Card>

      <Drawer open={!!sel} onClose={() => setSel(null)} title={sel ? `Event #${sel.seq}` : ''} subtitle={sel?.action}>
        {sel && (
          <div className="space-y-6">
            <Section label="Event">
              <DetailRow label="Action">{sel.action}</DetailRow>
              <DetailRow label="Category">{titleCase(sel.category)}</DetailRow>
              <DetailRow label="Target">{sel.target}</DetailRow>
              <DetailRow label="Actor">{sel.actor}</DetailRow>
              <DetailRow label="Timestamp">{formatDate(sel.ts)}</DetailRow>
            </Section>
            <Section label="Detail">
              <p className="text-sm text-foreground">{sel.detail}</p>
            </Section>
            <Section label="Integrity">
              <div className="space-y-2">
                <div className="rounded-lg border border-border bg-secondary/30 px-3 py-2">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Previous hash</p>
                  <p className="mt-0.5 break-all font-mono text-xs text-muted-foreground">{sel.prevHash}</p>
                </div>
                <div className="rounded-lg border border-border bg-secondary/30 px-3 py-2">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Content hash</p>
                  <p className="mt-0.5 break-all font-mono text-xs text-foreground">{sel.hash}</p>
                </div>
              </div>
            </Section>
          </div>
        )}
      </Drawer>
    </div>
  )
}
