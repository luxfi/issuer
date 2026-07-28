import { PageHeader } from '@/components/PageHeader'
import { Card, CardHeader, CardBody, Table, THead, TH, TBody, TR, TD, Badge, Skeleton, Stat, Meter } from '@/components/ui'
import { StatusBadge } from '@/components/StatusBadge'
import { Icon } from '@/components/icons'
import { useAsync } from '@/hooks/useAsync'
import { getFilings, getBadActorChecks, getRestrictions, getHolderLimits } from '@/lib/data'
import { formatNumber, formatDateShort, formatPct } from '@/lib/format'

export function Compliance() {
  const filings = useAsync(getFilings)
  const badActors = useAsync(getBadActorChecks)
  const restrictions = useAsync(getRestrictions)
  const limits = useAsync(getHolderLimits)

  const onFile = (filings.data ?? []).filter((f) => f.status === 'filed' || f.status === 'accepted' || f.status === 'effective').length
  const attention = (filings.data ?? []).filter((f) => f.status === 'pending' || f.status === 'overdue').length
  const clearActors = (badActors.data ?? []).filter((b) => b.result === 'clear').length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Compliance"
        desc="Transfer restrictions, blue-sky / state filings, Form D, bad-actor (Rule 506(d)) checks, and holder-of-record limits."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {filings.loading || limits.loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[104px]" />)
        ) : (
          <>
            <Stat label="Filings on file" value={formatNumber(onFile)} icon="fileCheck" />
            <Stat label="Needs attention" value={formatNumber(attention)} icon="alert" hint="pending / overdue" />
            <Stat label="Bad-actor cleared" value={`${clearActors}/${badActors.data?.length ?? 0}`} icon="shield" hint="Rule 506(d)" />
            <Stat label="Holder limit" value={`${limits.data?.holdersOfRecord}/${limits.data?.totalThreshold}`} icon="users" hint="§12(g) — within limits" />
          </>
        )}
      </div>

      {/* Holder-of-record limits (Exchange Act §12(g)) */}
      <Card>
        <CardHeader title="Holder-of-record limits" desc="Exchange Act §12(g) registration thresholds" />
        <CardBody className="grid gap-6 sm:grid-cols-2">
          {limits.loading || !limits.data ? (
            <>
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </>
          ) : (
            <>
              <div>
                <div className="mb-1 flex items-baseline justify-between text-sm">
                  <span className="font-medium text-foreground">Total holders of record</span>
                  <span className="tabular-nums text-muted-foreground">
                    {formatNumber(limits.data.holdersOfRecord)} / {formatNumber(limits.data.totalThreshold)}
                  </span>
                </div>
                <Meter value={limits.data.holdersOfRecord} max={limits.data.totalThreshold} tone="success" />
                <p className="mt-1 text-xs text-muted-foreground">{formatPct((limits.data.holdersOfRecord / limits.data.totalThreshold) * 100)} of 2,000 threshold</p>
              </div>
              <div>
                <div className="mb-1 flex items-baseline justify-between text-sm">
                  <span className="font-medium text-foreground">Non-accredited holders</span>
                  <span className="tabular-nums text-muted-foreground">
                    {formatNumber(limits.data.nonAccredited)} / {formatNumber(limits.data.nonAccreditedThreshold)}
                  </span>
                </div>
                <Meter value={limits.data.nonAccredited} max={limits.data.nonAccreditedThreshold} tone="success" />
                <p className="mt-1 text-xs text-muted-foreground">{formatPct((limits.data.nonAccredited / limits.data.nonAccreditedThreshold) * 100)} of 500 threshold</p>
              </div>
            </>
          )}
        </CardBody>
      </Card>

      {/* Filings */}
      <Card>
        <CardHeader title="Regulatory filings" desc="SEC & state notice filings by offering" />
        {filings.loading ? (
          <div className="space-y-2 p-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
        ) : (
          <Table>
            <THead>
              <TH>Filing</TH>
              <TH>Offering</TH>
              <TH>Jurisdiction</TH>
              <TH>Reference</TH>
              <TH>Filed / Due</TH>
              <TH>Status</TH>
            </THead>
            <TBody>
              {(filings.data ?? []).map((f) => (
                <TR key={f.id}>
                  <TD className="font-medium">{f.kind}</TD>
                  <TD className="text-muted-foreground">{f.offering}</TD>
                  <TD className="text-muted-foreground">{f.jurisdiction}</TD>
                  <TD className="font-mono text-xs text-muted-foreground">{f.reference}</TD>
                  <TD className="text-muted-foreground">{f.filed ? formatDateShort(f.filed) : f.due ? `due ${formatDateShort(f.due)}` : '—'}</TD>
                  <TD>
                    <StatusBadge status={f.status} />
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Bad-actor checks */}
        <Card>
          <CardHeader title="Bad-actor checks" desc="Rule 506(d) covered persons" />
          {badActors.loading ? (
            <div className="space-y-2 p-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-9" />)}</div>
          ) : (
            <Table>
              <THead>
                <TH>Covered person</TH>
                <TH>Role</TH>
                <TH>Checked</TH>
                <TH>Result</TH>
              </THead>
              <TBody>
                {(badActors.data ?? []).map((b) => (
                  <TR key={b.id}>
                    <TD className="font-medium">{b.person}</TD>
                    <TD className="text-xs text-muted-foreground">{b.role}</TD>
                    <TD className="text-muted-foreground">{formatDateShort(b.checked)}</TD>
                    <TD>
                      <StatusBadge status={b.result} dot={false} />
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </Card>

        {/* Transfer restrictions */}
        <Card>
          <CardHeader title="Transfer restrictions" desc="Legends, lock-ups, Rule 144 & Reg S" />
          {restrictions.loading ? (
            <div className="space-y-2 p-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-9" />)}</div>
          ) : (
            <Table>
              <THead>
                <TH>Security</TH>
                <TH>Basis</TH>
                <TH className="text-right">Shares</TH>
                <TH>Lifts</TH>
                <TH>Status</TH>
              </THead>
              <TBody>
                {(restrictions.data ?? []).map((r) => (
                  <TR key={r.id}>
                    <TD className="font-medium" title={r.legend}>{r.security}</TD>
                    <TD className="text-xs text-muted-foreground">{r.basis}</TD>
                    <TD className="text-right tabular-nums">{formatNumber(r.affects)}</TD>
                    <TD className="text-muted-foreground">{r.lifts ? formatDateShort(r.lifts) : '—'}</TD>
                    <TD>
                      <StatusBadge status={r.status} dot={false} />
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </Card>
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-border bg-secondary/20 px-4 py-2.5 text-xs text-muted-foreground">
        <Icon name="scale" size={14} className="mt-0.5 shrink-0" />
        <p>
          Filings, exemptions and thresholds shown are sandbox demonstration data. The platform operates as a
          registered transfer agent and broker-dealer; secondary trading is conducted on an SEC-registered ATS.
        </p>
      </div>
    </div>
  )
}
