import { useState } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { Card, Table, THead, TH, TBody, TR, TD, Badge, Button, Skeleton, Meter, Stat } from '@/components/ui'
import { StatusBadge } from '@/components/StatusBadge'
import { Drawer, DetailRow, Section } from '@/components/Drawer'
import { useAsync } from '@/hooks/useAsync'
import { getOfferings } from '@/lib/data'
import { EXEMPTION_LABEL } from '@/lib/labels'
import { formatCompact, formatAmount, formatNumber, formatDateShort, formatPct } from '@/lib/format'
import type { Offering } from '@/lib/types'

export function Offerings() {
  const { data, loading } = useAsync(getOfferings)
  const [sel, setSel] = useState<Offering | null>(null)
  const offerings = data ?? []

  const target = offerings.reduce((s, o) => s + o.targetCents, 0)
  const raised = offerings.reduce((s, o) => s + o.raisedCents, 0)
  const investors = offerings.reduce((s, o) => s + o.investors, 0)
  const live = offerings.filter((o) => o.status === 'live' || o.status === 'closing_soon').length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Offerings & Raises"
        desc="Exempt securities offerings the broker-dealer places under Reg D, Reg A+, Reg S and Reg CF."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[104px]" />)
        ) : (
          <>
            <Stat label="Aggregate target" value={formatCompact(target)} icon="coins" />
            <Stat label="Total raised" value={formatCompact(raised)} icon="treasury" hint={formatPct((raised / target) * 100) + ' of target'} />
            <Stat label="Subscriptions" value={formatNumber(investors)} icon="users" />
            <Stat label="Live offerings" value={formatNumber(live)} icon="activity" />
          </>
        )}
      </div>

      <Card>
        {loading ? (
          <div className="space-y-2 p-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
        ) : (
          <Table>
            <THead>
              <TH>Offering</TH>
              <TH>Exemption</TH>
              <TH>Security</TH>
              <TH className="w-[220px]">Raised / Target</TH>
              <TH className="text-right">Subs</TH>
              <TH>Status</TH>
            </THead>
            <TBody>
              {offerings.map((o) => (
                <TR key={o.id} onClick={() => setSel(o)}>
                  <TD className="font-medium">{o.name}</TD>
                  <TD>
                    <Badge tone="muted">{EXEMPTION_LABEL[o.exemption]}</Badge>
                  </TD>
                  <TD className="text-muted-foreground">{o.security}</TD>
                  <TD>
                    <div className="flex items-center gap-3">
                      <Meter value={o.raisedCents} max={o.targetCents} tone={o.status === 'funded' ? 'success' : 'foreground'} />
                      <span className="whitespace-nowrap text-xs tabular-nums text-muted-foreground">
                        {formatCompact(o.raisedCents)} / {formatCompact(o.targetCents)}
                      </span>
                    </div>
                  </TD>
                  <TD className="text-right tabular-nums">{formatNumber(o.subscriptions)}</TD>
                  <TD>
                    <StatusBadge status={o.status} />
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </Card>

      <Drawer
        open={!!sel}
        onClose={() => setSel(null)}
        title={sel?.name}
        subtitle={sel ? `${EXEMPTION_LABEL[sel.exemption]} · ${sel.security}` : ''}
        footer={
          sel && (
            <div className="flex gap-2">
              <Button variant="secondary" icon="doc" className="flex-1">
                Offering docs
              </Button>
              <Button variant="secondary" icon="users" className="flex-1">
                Subscriptions
              </Button>
            </div>
          )
        }
      >
        {sel && (
          <div className="space-y-6">
            <Section label="Progress">
              <div className="mb-2 flex items-baseline justify-between">
                <span className="text-lg font-semibold tabular-nums text-foreground">{formatCompact(sel.raisedCents)}</span>
                <span className="text-xs text-muted-foreground">of {formatCompact(sel.targetCents)} target</span>
              </div>
              <Meter value={sel.raisedCents} max={sel.targetCents} tone={sel.status === 'funded' ? 'success' : 'foreground'} />
              <div className="mt-2 flex items-center justify-between">
                <StatusBadge status={sel.status} />
                <span className="text-xs text-muted-foreground">{formatPct((sel.raisedCents / sel.targetCents) * 100)} subscribed</span>
              </div>
            </Section>
            <Section label="Terms">
              <DetailRow label="Exemption">{EXEMPTION_LABEL[sel.exemption]}</DetailRow>
              <DetailRow label="Security">{sel.security}</DetailRow>
              <DetailRow label="Price / share">{formatAmount(sel.pricePerShareCents, 'USD')}</DetailRow>
              <DetailRow label="Minimum">{formatAmount(sel.minCents, 'USD')}</DetailRow>
              <DetailRow label="Investors">{formatNumber(sel.investors)}</DetailRow>
              <DetailRow label="Jurisdiction">{sel.jurisdiction}</DetailRow>
            </Section>
            <Section label="Eligibility">
              <div className="flex flex-wrap gap-2">
                <Badge tone={sel.accreditedOnly ? 'info' : 'success'}>{sel.accreditedOnly ? 'Accredited only' : 'Open to non-accredited'}</Badge>
                <Badge tone={sel.generalSolicitation ? 'warning' : 'muted'}>{sel.generalSolicitation ? 'General solicitation' : 'No general solicitation'}</Badge>
              </div>
            </Section>
            <Section label="Timeline">
              <DetailRow label="Opened">{formatDateShort(sel.opened)}</DetailRow>
              <DetailRow label="Target close">{formatDateShort(sel.closes)}</DetailRow>
            </Section>
          </div>
        )}
      </Drawer>
    </div>
  )
}
