import { useMemo, useState } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { Card, Table, THead, TH, TBody, TR, TD, Badge, Button, Skeleton, Segmented, Stat, EmptyState } from '@/components/ui'
import { StatusBadge } from '@/components/StatusBadge'
import { Drawer, DetailRow, Section } from '@/components/Drawer'
import { Icon, type IconName } from '@/components/icons'
import { useAsync } from '@/hooks/useAsync'
import { getTAEvents, decideTransfer } from '@/lib/data'
import { formatNumber, formatDate, formatDateShort, titleCase } from '@/lib/format'
import type { TAEvent } from '@/lib/types'

type Filter = 'all' | 'issuance' | 'transfer' | 'pending' | 'restricted'

const typeIcon: Record<TAEvent['type'], IconName> = {
  issuance: 'plus',
  transfer: 'arrowRight',
  restriction: 'lock',
  release: 'check',
  conversion: 'link',
  cancellation: 'ban',
}

export function TransferAgent() {
  const { data, loading, refetch } = useAsync(getTAEvents)
  const [filter, setFilter] = useState<Filter>('all')
  const [sel, setSel] = useState<TAEvent | null>(null)
  const [busy, setBusy] = useState(false)
  const events = data ?? []

  const rows = useMemo(() => {
    switch (filter) {
      case 'issuance':
        return events.filter((e) => e.type === 'issuance')
      case 'transfer':
        return events.filter((e) => e.type === 'transfer')
      case 'pending':
        return events.filter((e) => e.status === 'pending')
      case 'restricted':
        return events.filter((e) => e.status === 'restricted' || !!e.holdUntil)
      default:
        return events
    }
  }, [events, filter])

  const issued = events.filter((e) => e.type === 'issuance').reduce((s, e) => s + e.shares, 0)
  const pending = events.filter((e) => e.status === 'pending').length
  const drs = events.filter((e) => e.drs).length

  async function decide(decision: 'settled' | 'rejected') {
    if (!sel) return
    setBusy(true)
    await decideTransfer(sel.id, decision)
    setBusy(false)
    setSel({ ...sel, status: decision })
    refetch()
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transfer Agent — Ledger"
        desc="The registered transfer-agent (TA) book of record: issuances, transfers, restrictions, Rule 144, and DRS book-entry positions."
        action={
          <Segmented
            value={filter}
            onChange={setFilter}
            options={[
              { label: 'All', value: 'all' },
              { label: 'Issuances', value: 'issuance' },
              { label: 'Transfers', value: 'transfer' },
              { label: 'Pending', value: 'pending' },
              { label: 'Restricted', value: 'restricted' },
            ]}
          />
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[104px]" />)
        ) : (
          <>
            <Stat label="Ledger entries" value={formatNumber(events.length)} icon="ledger" />
            <Stat label="Shares issued" value={formatNumber(issued)} icon="layers" />
            <Stat label="Pending review" value={formatNumber(pending)} icon="clock" hint="require TA action" />
            <Stat label="DRS positions" value={formatNumber(drs)} icon="server" hint="book-entry" />
          </>
        )}
      </div>

      <Card>
        {loading ? (
          <div className="space-y-2 p-4">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
        ) : rows.length === 0 ? (
          <EmptyState icon="ledger" title="No entries" desc="No ledger entries match this filter." />
        ) : (
          <Table>
            <THead>
              <TH>Entry</TH>
              <TH>Type</TH>
              <TH>Security</TH>
              <TH>From → To</TH>
              <TH className="text-right">Shares</TH>
              <TH>Status</TH>
              <TH className="text-right">Date</TH>
            </THead>
            <TBody>
              {rows.map((e) => (
                <TR key={e.id} onClick={() => setSel(e)}>
                  <TD className="font-mono text-xs">{e.id}</TD>
                  <TD>
                    <span className="inline-flex items-center gap-1.5 capitalize text-muted-foreground">
                      <Icon name={typeIcon[e.type]} size={14} />
                      {e.type}
                    </span>
                  </TD>
                  <TD className="text-muted-foreground">{e.security}</TD>
                  <TD>
                    <span className="text-xs">
                      <span className="text-muted-foreground">{e.from}</span>
                      <span className="mx-1 text-muted-foreground">→</span>
                      <span className="font-medium text-foreground">{e.to}</span>
                    </span>
                  </TD>
                  <TD className="text-right tabular-nums">{formatNumber(e.shares)}</TD>
                  <TD>
                    <StatusBadge status={e.status} />
                  </TD>
                  <TD className="text-right text-muted-foreground">{formatDateShort(e.date)}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </Card>

      <Drawer
        open={!!sel}
        onClose={() => setSel(null)}
        title={sel?.id}
        subtitle={sel ? `${titleCase(sel.type)} · ${sel.security}` : ''}
        footer={
          sel && sel.status === 'pending' ? (
            <div className="flex gap-2">
              <Button variant="success" icon="check" className="flex-1" disabled={busy} onClick={() => decide('settled')}>
                Settle
              </Button>
              <Button variant="danger" icon="ban" className="flex-1" disabled={busy} onClick={() => decide('rejected')}>
                Reject
              </Button>
            </div>
          ) : (
            <p className="text-center text-xs text-muted-foreground">
              {sel ? titleCase(sel.status) : ''} — recorded on the transfer-agent book
            </p>
          )
        }
      >
        {sel && (
          <div className="space-y-6">
            <Section label="Entry">
              <DetailRow label="Reference"><span className="font-mono text-xs">{sel.id}</span></DetailRow>
              <DetailRow label="Type">{titleCase(sel.type)}</DetailRow>
              <DetailRow label="Security">{sel.security}</DetailRow>
              <DetailRow label="Shares / units">{formatNumber(sel.shares)}</DetailRow>
              <DetailRow label="Form">{sel.drs ? 'DRS (book-entry)' : 'Certificated'}</DetailRow>
              <DetailRow label="Date">{formatDate(sel.date)}</DetailRow>
            </Section>
            <Section label="Parties">
              <DetailRow label="From">{sel.from}</DetailRow>
              <DetailRow label="To">{sel.to}</DetailRow>
            </Section>
            {(sel.restriction || sel.holdUntil) && (
              <Section label="Restriction / Legend">
                {sel.restriction && (
                  <div className="rounded-lg border border-border bg-secondary/30 px-3 py-2 text-xs text-muted-foreground">
                    {sel.restriction}
                  </div>
                )}
                {sel.holdUntil && (
                  <div className="mt-2 flex items-center gap-2">
                    <Badge tone="info" dot>
                      Holds until {formatDateShort(sel.holdUntil)}
                    </Badge>
                  </div>
                )}
              </Section>
            )}
          </div>
        )}
      </Drawer>
    </div>
  )
}
