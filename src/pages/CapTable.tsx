import { useState } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { Card, CardHeader, CardBody, Table, THead, TH, TBody, TR, TD, Avatar, Badge, Skeleton, Stat, Meter, Segmented } from '@/components/ui'
import { Donut } from '@/components/charts'
import { Drawer, DetailRow, Section } from '@/components/Drawer'
import { useAsync } from '@/hooks/useAsync'
import { getShareClasses, getHolders, getOverview } from '@/lib/data'
import { formatCompactNumber, formatNumber, formatAmount, formatPct, formatDateShort, initials, titleCase } from '@/lib/format'
import type { Holder } from '@/lib/types'

type View = 'holders' | 'classes'

export function CapTable() {
  const classes = useAsync(getShareClasses)
  const holders = useAsync(getHolders)
  const overview = useAsync(getOverview)
  const [view, setView] = useState<View>('holders')
  const [sel, setSel] = useState<Holder | null>(null)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Capitalization Table"
        desc="Share classes, holders of record, fully-diluted ownership, options pool and vesting."
        action={
          <Segmented
            value={view}
            onChange={setView}
            options={[
              { label: 'Holders', value: 'holders' },
              { label: 'Share classes', value: 'classes' },
            ]}
          />
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {overview.loading || !overview.data ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[104px]" />)
        ) : (
          <>
            <Stat label="Outstanding" value={formatCompactNumber(overview.data.securitiesIssued)} icon="layers" />
            <Stat label="Fully diluted" value={formatCompactNumber(overview.data.fullyDiluted)} icon="pie" />
            <Stat label="Options available" value={formatCompactNumber(overview.data.optionsAvailable)} icon="key" hint="2024 Plan" />
            <Stat label="Holders of record" value={formatNumber(overview.data.holders)} icon="users" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title={view === 'holders' ? 'Holders' : 'Share classes'} desc={view === 'holders' ? 'Ownership by holder (fully-diluted)' : 'Authorized vs issued by class'} />
          {view === 'holders' ? (
            holders.loading ? (
              <div className="space-y-2 p-4">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
            ) : (
              <Table>
                <THead>
                  <TH>Holder</TH>
                  <TH>Class</TH>
                  <TH className="text-right">Shares</TH>
                  <TH className="text-right">Outstanding</TH>
                  <TH className="text-right">Fully diluted</TH>
                </THead>
                <TBody>
                  {(holders.data ?? []).map((h) => (
                    <TR key={h.id} onClick={() => setSel(h)}>
                      <TD>
                        <div className="flex items-center gap-2.5">
                          <Avatar label={initials(h.name)} />
                          <div className="leading-tight">
                            <p className="font-medium">{h.name}</p>
                            <p className="text-xs capitalize text-muted-foreground">{h.type}</p>
                          </div>
                        </div>
                      </TD>
                      <TD className="text-muted-foreground">{h.className}</TD>
                      <TD className="text-right tabular-nums">{formatNumber(h.shares)}</TD>
                      <TD className="text-right tabular-nums text-muted-foreground">{h.ownershipPct > 0 ? formatPct(h.ownershipPct) : '—'}</TD>
                      <TD className="text-right font-medium tabular-nums">{formatPct(h.fdOwnershipPct)}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            )
          ) : classes.loading ? (
            <div className="space-y-2 p-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
          ) : (
            <Table>
              <THead>
                <TH>Class</TH>
                <TH className="w-[180px]">Issued / Authorized</TH>
                <TH className="text-right">Price</TH>
                <TH className="text-right">Votes</TH>
                <TH>Liquidation</TH>
              </THead>
              <TBody>
                {(classes.data ?? []).map((c) => (
                  <TR key={c.id}>
                    <TD className="font-medium">{c.name}</TD>
                    <TD>
                      <div className="flex items-center gap-3">
                        <Meter value={c.issued} max={c.authorized} />
                        <span className="whitespace-nowrap text-xs tabular-nums text-muted-foreground">
                          {formatCompactNumber(c.issued)} / {formatCompactNumber(c.authorized)}
                        </span>
                      </div>
                    </TD>
                    <TD className="text-right tabular-nums">{formatAmount(c.pricePerShareCents, 'USD')}</TD>
                    <TD className="text-right tabular-nums text-muted-foreground">{c.votesPerShare}</TD>
                    <TD className="text-muted-foreground">{c.liquidationPref}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </Card>

        <Card>
          <CardHeader title="Fully-diluted split" desc="By share class" />
          <CardBody>
            {overview.loading || !overview.data ? (
              <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-6" />)}</div>
            ) : (
              <Donut data={overview.data.classMix} />
            )}
          </CardBody>
        </Card>
      </div>

      <Drawer
        open={!!sel}
        onClose={() => setSel(null)}
        title={sel?.name}
        subtitle={sel ? `${titleCase(sel.type)} · ${sel.className}` : ''}
      >
        {sel && (
          <div className="space-y-6">
            <Section label="Position">
              <DetailRow label="Shares / units">{formatNumber(sel.shares)}</DetailRow>
              <DetailRow label="Class">{sel.className}</DetailRow>
              <DetailRow label="Outstanding %">{sel.ownershipPct > 0 ? formatPct(sel.ownershipPct) : '—'}</DetailRow>
              <DetailRow label="Fully-diluted %">{formatPct(sel.fdOwnershipPct)}</DetailRow>
              {sel.invested_cents > 0 && <DetailRow label="Invested">{formatAmount(sel.invested_cents, 'USD')}</DetailRow>}
              <DetailRow label="Holder since">{formatDateShort(sel.since)}</DetailRow>
            </Section>
            {sel.vested && (
              <Section label="Vesting">
                <div className="mb-2 flex items-baseline justify-between">
                  <span className="text-sm font-medium text-foreground">
                    {formatNumber(sel.vested.vested)} / {formatNumber(sel.vested.granted)} vested
                  </span>
                  <Badge tone="info">{formatPct((sel.vested.vested / sel.vested.granted) * 100, 0)}</Badge>
                </div>
                <Meter value={sel.vested.vested} max={sel.vested.granted} tone="foreground" />
                <div className="mt-3">
                  <DetailRow label="Cliff">{formatDateShort(sel.vested.cliff)}</DetailRow>
                  <DetailRow label="Fully vested">{formatDateShort(sel.vested.end)}</DetailRow>
                </div>
              </Section>
            )}
          </div>
        )}
      </Drawer>
    </div>
  )
}
